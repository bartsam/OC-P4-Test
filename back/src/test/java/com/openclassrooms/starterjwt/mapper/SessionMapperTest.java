package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("SessionMapper Unit Tests")
class SessionMapperTest {

    @Mock
    private TeacherService teacherService;

    @Mock
    private UserService userService;

    @InjectMocks
    private SessionMapperImpl sessionMapper;

    @Nested
    @DisplayName("toEntity Tests")
    class ToEntityTests {

        @Test
        @DisplayName("should map list of SessionDto to list of entity")
        void shouldMapDtoListToEntityList() {
            // GIVEN
            SessionDto sessionDto = new SessionDto();
            sessionDto.setDescription("Test");

            // WHEN
            List<Session> sessions = sessionMapper.toEntity(List.of(sessionDto));

            // THEN
            assertThat(sessions).hasSize(1);
            assertThat(sessions.getFirst().getDescription()).isEqualTo("Test");
        }

        @Test
        @DisplayName("should return null when input SessionDto list is null")
        void shouldReturnNull_whenDtoListIsNull() {
            // GIVEN
            List<SessionDto> sessionDtos = null;

            // WHEN
            List<Session> sessions = sessionMapper.toEntity(sessionDtos);

            // THEN
            assertThat(sessions).isNull();
        }

        @Test
        @DisplayName("should load and map teacher entity when teacher_id is provided")
        void shouldMapTeacher_whenTeacherIdIsProvided() {
            // GIVEN
            SessionDto sessionDto = new SessionDto();
            sessionDto.setTeacher_id(1L);

            Teacher teacher = new Teacher();
            teacher.setId(1L);

            when(teacherService.findById(1L)).thenReturn(teacher);

            // WHEN
            Session session = sessionMapper.toEntity(sessionDto);

            // THEN
            assertThat(session.getTeacher()).isEqualTo(teacher);
        }

        @Test
        @DisplayName("should set teacher to null when teacher_id is null")
        void shouldSetTeacherToNull_whenTeacherIdIsNull() {
            // GIVEN
            SessionDto sessionDto = new SessionDto();
            sessionDto.setTeacher_id(null);

            // WHEN
            Session session = sessionMapper.toEntity(sessionDto);

            // THEN
            assertThat(session.getTeacher()).isNull();
        }

        @Test
        @DisplayName("should load and map list of users when user ids are provided")
        void shouldMapUsers_whenUserIdsAreProvided() {
            // GIVEN
            User user = new User();
            user.setId(1L);

            SessionDto sessionDto = new SessionDto();
            sessionDto.setUsers(List.of(1L));

            when(userService.findById(1L)).thenReturn(user);

            // WHEN
            Session session = sessionMapper.toEntity(sessionDto);

            // THEN
            assertThat(session.getUsers()).containsExactly(user);
        }

        @Test
        @DisplayName("should map null in user list when user is not found by id")
        void shouldMapNull_whenUserNotFound() {
            // GIVEN
            SessionDto sessionDto = new SessionDto();
            sessionDto.setUsers(List.of(1L));

            when(userService.findById(1L)).thenReturn(null);

            // WHEN
            Session session = sessionMapper.toEntity(sessionDto);

            // THEN
            assertThat(session.getUsers()).containsOnlyNulls();
        }

    }

    @Nested
    @DisplayName("toDto Tests")
    class ToDtoTests {

        @Test
        @DisplayName("Should extract teacher_id from Teacher entity")
        void shouldExtractTeacherId_whenTeacherExists() {
            // GIVEN
            Teacher teacher = new Teacher();
            teacher.setId(1L);

            Session session = new Session();
            session.setTeacher(teacher);

            // WHEN
            SessionDto sessionDto = sessionMapper.toDto(session);

            // THEN
            assertThat(sessionDto.getTeacher_id()).isEqualTo(1L);
        }

        @Test
        @DisplayName("should set teacher_id to null when Teacher entity is null")
        void shouldSetTeacherIdNull_whenTeacherIsNull() {
            // GIVEN
            Session session = new Session();
            session.setTeacher(null);

            // WHEN
            SessionDto sessionDto = sessionMapper.toDto(session);

            // THEN
            assertThat(sessionDto.getTeacher_id()).isNull();
        }

        @Test
        @DisplayName("should extract user IDs from list of User entities")
        void shouldExtractUserIds_whenUsersExist() {
            // GIVEN
            User user = new User();
            user.setId(1L);

            Session session = new Session();
            session.setUsers(List.of(user));

            // WHEN
            SessionDto sessionDto = sessionMapper.toDto(session);

            // THEN
            assertThat(sessionDto.getUsers()).containsExactly(1L);
        }

        @Test
        @DisplayName("should return empty user ID list when users is null")
        void shouldReturnEmptyUserIdsList_whenUsersIsNull() {
            // GIVEN
            Session session = new Session();
            session.setUsers(null);

            // WHEN
            SessionDto sessionDto = sessionMapper.toDto(session);

            // THEN
            assertThat(sessionDto.getUsers()).isEmpty();
        }

    }
}