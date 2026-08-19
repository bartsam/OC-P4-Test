package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@Tag("sessionServiceUnitTests")
@DisplayName("Session Service Unit Tests")
public class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private SessionService sessionService;

    @Captor
    private ArgumentCaptor<Session> sessionCaptor;

    @Nested
    @Tag("getById")
    @DisplayName("Get By Id")
    class GetByIdTests {
        @Test
        @DisplayName("should return session with id when exist")
        void getById_shouldReturnSession_whenExist() {
            Session session = new Session();
            session.setId(1L);
            when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

            Session result = sessionService.getById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("should throw NotFoundException when session does not exist")
        void getById_shouldThrowNotFoundException_whenSessionDoesNotExist() {
            when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> sessionService.getById(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Test
    @Tag("findAll")
    @DisplayName("should return all sessions")
    void findAll_shouldReturnAllSession() {
        List<Session> sessions = List.of(new Session(), new Session());
        when(sessionRepository.findAll()).thenReturn(sessions);

        List<Session> result = sessionService.findAll();

        assertThat(result).hasSize(2);
        verify(sessionRepository, times(1)).findAll();
    }

    @Test
    @Tag("create")
    @DisplayName("should create session")
    void create_shouldSaveSession() {
        Session sessionToSave = new Session();
        Session savedSession = new Session();
        savedSession.setId(1L);
        when(sessionRepository.save(sessionToSave)).thenReturn(savedSession);

        Session result = sessionService.create(sessionToSave);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(sessionRepository, times(1)).save(sessionToSave);
    }

    @Test
    @Tag("update")
    @DisplayName("should update a session")
    void update_shouldUpdateSession() {
        Session sessionInput = new Session();
        Session updatedSession = new Session();
        updatedSession.setId(1L);
        when(sessionRepository.save(sessionInput)).thenReturn(updatedSession);

        Session result = sessionService.update(1L, sessionInput);

        verify(sessionRepository, times(1)).save(sessionCaptor.capture());
        assertThat(sessionCaptor.getValue().getId()).isEqualTo(1L);
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @Tag("delete")
    @DisplayName("should delete a session")
    void delete_shouldDeleteSession() {
        Long sessionId = 1L;

        sessionService.delete(sessionId);

        verify(sessionRepository, times(1)).deleteById(sessionId);
    }

    @Nested
    @Tag("participate")
    @DisplayName("Participate")
    class ParticipateTests {
        @Test
        @DisplayName("should add user to session when user exists and not already participating")
        void participate_shouldAddUser_whenNotAlreadyParticipating() {
            User user = new User();
            user.setId(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            Session session = new Session();
            session.setId(1L);
            session.setUsers(new ArrayList<>());
            when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

            sessionService.participate(1L, 1L);

            verify(sessionRepository, times(1)).save(sessionCaptor.capture());
            assertThat(sessionCaptor.getValue().getUsers()).contains(user);
        }

        @Test
        @DisplayName("should throw BadRequestException when user already participates")
        void participate_shouldThrowBadRequestException_whenAlreadyParticipating() {
            User user = new User();
            user.setId(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            Session session = new Session();
            session.setId(1L);
            session.setUsers(new ArrayList<>(List.of(user)));
            when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

            assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                    .isInstanceOf(BadRequestException.class);

            verify(sessionRepository, never()).save(any(Session.class));
        }

        @Test
        @DisplayName("should throw NotFoundException when session does not exist")
        void participate_shouldThrowNotFoundException_whenSessionDoesNotExist() {
            when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> sessionService.participate(1L, 2L))
                    .isInstanceOf(NotFoundException.class);

            verify(sessionRepository, never()).save(any(Session.class));
        }

        @Test
        @DisplayName("should throw NotFoundException when user does not exist")
        void participate_shouldThrowNotFoundException_whenUserDoesNotExist() {
            Session session = new Session();
            session.setId(1L);
            when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
            when(userRepository.findById(2L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> sessionService.participate(1L, 2L))
                    .isInstanceOf(NotFoundException.class);

            verify(sessionRepository, never()).save(any(Session.class));
        }
    }

    @Nested
    @Tag("noLongerParticipate")
    @DisplayName("No Longer Participate")
    class NoLongerParticipateTests {
        @Test
        @DisplayName("should remove user to session when user is participating")
        void noLongerParticipate_shouldRemoveUser_whenParticipating() {
            User userToRemove = new User();
            userToRemove.setId(1L);
            User userToKeep = new User();
            userToKeep.setId(2L);
            Session session = new Session();
            session.setId(1L);
            session.setUsers(new ArrayList<>(List.of(userToRemove, userToKeep)));
            when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

            sessionService.noLongerParticipate(1L, 1L);

            verify(sessionRepository, times(1)).save(sessionCaptor.capture());
            List<User> remainingUsers = sessionCaptor.getValue().getUsers();
            assertThat(remainingUsers).doesNotContain(userToRemove);
            assertThat(remainingUsers).contains(userToKeep);
        }

        @Test
        @DisplayName("should throw BadRequestException when user is not participating")
        void noLongerParticipate_shouldThrowBadRequestException_whenNotParticipating() {
            Session session = new Session();
            session.setId(1L);
            session.setUsers(new ArrayList<>());
            when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

            assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L))
                    .isInstanceOf(BadRequestException.class);

            verify(sessionRepository, never()).save(any(Session.class));
        }

        @Test
        @DisplayName("should throw NotFoundException when session does not exist")
        void noLongerParticipate_shouldThrowNotFoundException_whenSessionDoesNotExist() {
            when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L))
                    .isInstanceOf(NotFoundException.class);

            verify(sessionRepository, never()).save(any(Session.class));

        }

    }


}
