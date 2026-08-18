package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthTokenFilterTest {

    @Mock
    private JwtUtils jwtUtils;
    @Mock
    private UserDetailsServiceImpl userDetailsService;
    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;
    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private AuthTokenFilter authTokenFilter;

    @Mock
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    @DisplayName("doFilterInternal")
    class DoFilterInternal {

        @Test
        @DisplayName("should set authentication when token is valid")
        void shouldSetAuthentication_whenTokenValid() throws Exception {
            // GIVEN
            when(request.getHeader("Authorization")).thenReturn("Bearer validToken");

            when(jwtUtils.validateJwtToken("validToken")).thenReturn(true);
            when(jwtUtils.getUserNameFromJwtToken("validToken")).thenReturn("test@example.com");

            when(userDetails.getAuthorities()).thenReturn(Collections.emptyList());
            when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(userDetails);

            // WHEN
            authTokenFilter.doFilterInternal(request, response, filterChain);

            // THEN
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
            assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo(userDetails);
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("should not set authentication when no Authorization header")
        void shouldNotSetAuthentication_whenNoHeader() throws Exception {
            // GIVEN
            when(request.getHeader("Authorization")).thenReturn(null);

            // WHEN
            authTokenFilter.doFilterInternal(request, response, filterChain);

            // THEN
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("should not set authentication when token is invalid")
        void shouldNotSetAuthentication_whenTokenInvalid() throws Exception {
            // GIVEN
            when(request.getHeader("Authorization")).thenReturn("Bearer invalidToken");
            when(jwtUtils.validateJwtToken("invalidToken")).thenReturn(false);

            // WHEN
            authTokenFilter.doFilterInternal(request, response, filterChain);

            // THEN
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("should not set authentication when header does not start with Bearer")
        void shouldNotSetAuthentication_whenHeaderMissingBearerPrefix() throws Exception {
            // GIVEN
            when(request.getHeader("Authorization")).thenReturn("Basic wrongToken");

            // WHEN
            authTokenFilter.doFilterInternal(request, response, filterChain);

            // THEN
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("should continue filter chain even when an exception is thrown")
        void shouldContinueChain_whenExceptionThrown() throws Exception {
            // GIVEN
            when(request.getHeader("Authorization")).thenReturn("Bearer validToken");
            when(jwtUtils.validateJwtToken("validToken")).thenReturn(true);
            when(jwtUtils.getUserNameFromJwtToken("validToken")).thenThrow(new RuntimeException("BOOM"));

            // WHEN
            authTokenFilter.doFilterInternal(request, response, filterChain);

            // THEN
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }

    }

}
