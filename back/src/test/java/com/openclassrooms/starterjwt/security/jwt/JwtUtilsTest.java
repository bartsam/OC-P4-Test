package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class JwtUtilsTest {

    private static final SecretKey SECRET_KEY_1 = Keys.secretKeyFor(SignatureAlgorithm.HS512);
    private static final SecretKey SECRET_KEY_2 = Keys.secretKeyFor(SignatureAlgorithm.HS512);

    private static final String TEST_SECRET = Base64.getEncoder().encodeToString(SECRET_KEY_1.getEncoded());
    private static final String OTHER_SECRET = Base64.getEncoder().encodeToString(SECRET_KEY_2.getEncoded());

    @Mock
    UserDetailsImpl userDetails;
    @Mock
    Authentication authentication;

    @InjectMocks
    JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000);
    }

    @Test
    @Tag("generateJwtToken")
    @DisplayName("should generate valid token ")
    void generateJwtToken_shouldReturnValidToken() {
        // GIVEN
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("test@example.com");

        // WHEN
        String token = jwtUtils.generateJwtToken(authentication);

        // THEN
        assertThat(token).isNotNull();
        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
    }

    @Test
    @Tag("getUserNameFromJwtToken")
    @DisplayName("should extract username from token ")
    void generateJwtToken_shouldExtractUsernameFromToken() {
        // GIVEN
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("test@example.com");

        // WHEN
        String token = jwtUtils.generateJwtToken(authentication);

        // THEN
        assertThat(token).isNotNull();
        assertThat(jwtUtils.getUserNameFromJwtToken(token)).isEqualTo("test@example.com");
    }

    @Nested
    @DisplayName("validateJwtToken")
    class ValidateJwtToken {
        @Test
        @DisplayName("should return false when secret is wrong")
        void validateToken_shouldReturnFalse_whenSignatureInvalid() {
            //WHEN
            String tokenWithWrongSecret = Jwts.builder()
                    .setSubject("test@example.com")
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                    .signWith(SignatureAlgorithm.HS512, OTHER_SECRET)
                    .compact();
            // THEN
            assertThat(jwtUtils.validateJwtToken(tokenWithWrongSecret)).isFalse();
        }

        @Test
        @DisplayName("should return false when secret malformed")
        void validateToken_shouldReturnFalse_whenTokenMalformed() {
            // THEN
            assertThat(jwtUtils.validateJwtToken("This.Is.A.Wrong.Jwt")).isFalse();
        }

        @Test
        @DisplayName("should return false when expired")
        void validateJwtToken_shouldReturnFalse_whenTokenExpired() {
            //WHEN
            String expiredToken = Jwts.builder()
                    .setSubject("test@example.com")
                    .setIssuedAt(new Date(System.currentTimeMillis() - 3600000))
                    .setExpiration(new Date(System.currentTimeMillis() - 1000))
                    .signWith(SignatureAlgorithm.HS512, TEST_SECRET)
                    .compact();

            // THEN
            assertThat(jwtUtils.validateJwtToken(expiredToken)).isFalse();
        }

        @Test
        @DisplayName("should return false when token is uncompleted")
        void validateToken_shouldReturnFalse_whenTokenUnsupported() {
            String unsupportedToken = Jwts.builder()
                    .setSubject("test@example.com")
                    .compact();

            assertThat(jwtUtils.validateJwtToken(unsupportedToken)).isFalse();
        }

        @Test
        @DisplayName("should return false when secret empty")
        void validateToken_shouldReturnFalse_whenTokenEmpty() {
            // THEN
            assertThat(jwtUtils.validateJwtToken("")).isFalse();
        }

    }
}
