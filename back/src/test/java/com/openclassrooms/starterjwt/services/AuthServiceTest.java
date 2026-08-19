package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@Tag("authServiceUnitTests")
@DisplayName("Auth Service Unit Tests")
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private AuthService authService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @Nested
    @Tag("isAdmin")
    @DisplayName("IsAdmin")
    class IsAdminTests {
        @Test
        @DisplayName("should return true when user is admin")
        void isAdmin_shouldReturnTrue_whenUserAdmin() {
            User user = new User("test@test.com", "Doe", "John", "password", true);
            when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

            boolean result = authService.isAdmin("test@test.com");

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false when user is not admin")
        void isAdmin_shouldReturnFalse_whenUserNotAdmin() {
            User user = new User("test@test.com", "Doe", "John", "password", false);
            when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

            boolean result = authService.isAdmin("test@test.com");

            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should return false when user do not exist")
        void isAdmin_shouldReturnFalse_whenUserNotExist() {
            when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());

            boolean result = authService.isAdmin("test@test.com");

            assertThat(result).isFalse();
        }
    }

    @Nested
    @Tag("register")
    @DisplayName("Register")
    class RegisterTests {
        @Test
        @DisplayName("should save user when email is new")
        void register_shouldSaveUser_whenNewEmail() {
            SignupRequest request = new SignupRequest();
            request.setEmail("test@test.com");
            request.setLastName("Doe");
            request.setFirstName("John");
            request.setPassword("password123");

            when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
            when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

            authService.register(request);

            verify(passwordEncoder, times(1)).encode("password123");
            verify(userRepository, times(1)).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();
            assertThat(savedUser.getEmail()).isEqualTo("test@test.com");
            assertThat(savedUser.getFirstName()).isEqualTo("John");
            assertThat(savedUser.getLastName()).isEqualTo("Doe");
            assertThat(savedUser.getPassword()).isEqualTo("encodedPassword");
            assertThat(savedUser.isAdmin()).isFalse();
        }

        @Test
        @DisplayName("should throw BadRequestException when email already exists")
        void register_shouldThrowBadRequestException_whenEmailAlreadyExists() {
            SignupRequest request = new SignupRequest();
            request.setEmail("test@test.com");

            when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(BadRequestException.class);

            verify(passwordEncoder, never()).encode(anyString());
            verify(userRepository, never()).save(any(User.class));
        }
    }

}
