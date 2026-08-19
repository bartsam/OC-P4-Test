package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.exception.UnauthorizedException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@Tag("userServiceUnitTests")
@DisplayName("User Service Unit Tests")
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private UserService userService;

    @Mock
    private Authentication authentication;
    @Mock
    private SecurityContext securityContext;
    @Mock
    private UserDetails userDetails;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    @Tag("findById")
    @DisplayName("findById")
    class FindByIdTests {
        @Test
        @DisplayName("should return user with id when exists")
        void findById_shouldReturnUser_whenExists() {
            User user = new User();
            user.setId(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            User result = userService.findById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("should throw NotFoundException when user does not exist")
        void findById_shouldThrowNotFoundException_whenUserDoesNotExist() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.findById(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @Tag("deleteIfOwner")
    @DisplayName("deleteIfOwner")
    class DeleteIfOwnerTests {

        @Test
        @DisplayName("should delete user when authenticated user is owner")
        void deleteIfOwner_shouldDeleteUser_whenOwner() {
            User user = new User();
            user.setId(1L);
            user.setEmail("test@test.com");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userDetails.getUsername()).thenReturn("test@test.com");
            when(authentication.getPrincipal()).thenReturn(userDetails);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);

            userService.deleteIfOwner(1L);

            verify(userRepository, times(1)).deleteById(1L);
        }

        @Test
        @DisplayName("should throw UnauthorizedException when authenticated user is not owner")
        void deleteIfOwner_shouldThrowUnauthorized_whenNotOwner() {
            User user = new User();
            user.setId(1L);
            user.setEmail("test@test.com");

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userDetails.getUsername()).thenReturn("other@test.com");
            when(authentication.getPrincipal()).thenReturn(userDetails);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);

            assertThatThrownBy(() -> userService.deleteIfOwner(1L))
                    .isInstanceOf(UnauthorizedException.class);

            verify(userRepository, never()).deleteById(anyLong());
        }

        @Test
        @DisplayName("should throw NotFoundException when user to delete do not exist")
        void deleteIfOwner_shouldThrowNotFoundException_whenUserDoesNotExist() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deleteIfOwner(1L))
                    .isInstanceOf(NotFoundException.class);

            verify(userRepository, never()).deleteById(anyLong());
        }
    }

}
