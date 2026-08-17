package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("teacherServiceUnitTests")
@DisplayName("Teacher Service Unit Tests")
public class UserDetailsServiceImplTest {

    @Mock
    UserRepository userRepository;

    @InjectMocks
    UserDetailsServiceImpl userDetailsService;

    @Test
    @Tag("loadUserByUsername")
    @DisplayName("Should load user by username")
    void loadUserByUsername_shouldLoadUserByUsername() {
        User user = new User("test@test.com", "Biche", "Jean", "Password123!", false);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        UserDetails result = userDetailsService.loadUserByUsername("test@test.com");

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("test@test.com");
        assertThat(result.getPassword()).isEqualTo("Password123!");
    }

    @Test
    @Tag("loadUserByUsername")
    @DisplayName("Should throw UsernameNotFoundException when user not found")
    void loadUserByUsername_shouldThrowUsernameNotFoundException_whenUserNotFound() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("test@test.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

}
