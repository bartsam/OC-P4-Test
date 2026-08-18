package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class UserDetailsImplTest {

    @Nested
    @DisplayName("equals")
    class EqualsTests {
        @Test
        @DisplayName("should return true when same id")
        void equals_shouldBeTrue_whenSameId() {
            // GIVEN
            UserDetailsImpl userA = UserDetailsImpl.builder()
                    .id(1L)
                    .username("u")
                    .password("p")
                    .build();
            UserDetailsImpl userB = UserDetailsImpl.builder()
                    .id(1L)
                    .username("other")
                    .password("x")
                    .build();
            // THEN
            assertThat(userA).isEqualTo(userB);
        }

        @Test
        @DisplayName("should return true when compared to itself")
        void equals_shouldReturnTrue_whenSameInstance() {
            // GIVEN
            UserDetailsImpl user = UserDetailsImpl.builder().id(1L).build();
            // THEN
            assertThat(user.equals(user)).isTrue();
        }

        @Test
        @DisplayName("should return false when different id")
        void equals_shouldBeFalse_whenDifferentId() {
            // GIVEN
            UserDetailsImpl userA = UserDetailsImpl.builder().id(1L).build();
            UserDetailsImpl userB = UserDetailsImpl.builder().id(2L).build();
            // THEN
            assertThat(userA).isNotEqualTo(userB);
        }

        @Test
        @DisplayName("should return false when compared to null")
        void equals_shouldHandleNullAndOtherClass() {
            // GIVEN
            UserDetailsImpl user = UserDetailsImpl.builder().id(1L).build();
            // THEN
            assertThat(user).isNotEqualTo(null);
        }

        @Test
        @DisplayName("should return false when compared to different class")
        void equals_shouldReturnFalse_whenDifferentClass() {
            // GIVEN
            UserDetailsImpl user = UserDetailsImpl.builder().id(1L).build();
            // THEN
            assertThat(user.equals("not a UserDetailsImpl")).isFalse();
        }
    }


    @Test
    @DisplayName("should expose admin flag via getter")
    void getAdmin_shouldReturnConfiguredValue() {
        // GIVEN
        UserDetailsImpl adminUser = UserDetailsImpl.builder().id(1L).admin(true).build();
        UserDetailsImpl user = UserDetailsImpl.builder().id(2L).admin(false).build();

        // THEN
        assertThat(adminUser.getAdmin()).isTrue();
        assertThat(user.getAdmin()).isFalse();
    }
}