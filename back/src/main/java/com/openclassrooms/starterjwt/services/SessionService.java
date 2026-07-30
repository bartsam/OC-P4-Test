package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionService {
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final SessionMapper sessionMapper;

    public SessionService(SessionRepository sessionRepository, UserRepository userRepository, SessionMapper sessionMapper) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.sessionMapper = sessionMapper;
    }

    public Session getById(Long id) {
        Session session = this.sessionRepository.findById(id).orElse(null);

        if (session == null) {
            throw new NotFoundException();
        }

        return session;
    }

    public SessionDto getDtoById(Long id) {
        return this.sessionMapper.toDto(getById(id));
    }

    public List<Session> findAll() {
        return this.sessionRepository.findAll();
    }

    public List<SessionDto> findAllDto() {
        return this.sessionMapper.toDto(findAll());
    }

    public SessionDto create(SessionDto sessionDto) {
        Session session = this.sessionRepository.save(this.sessionMapper.toEntity(sessionDto));
        return this.sessionMapper.toDto(session);
    }

    public void participate(Long id, Long userId) {
        Session session = getById(id);
        User user = this.userRepository.findById(userId).orElse(null);
        if (session == null || user == null) {
            throw new NotFoundException();
        }

        boolean alreadyParticipate = session.getUsers().stream().anyMatch(o -> o.getId().equals(userId));
        if (alreadyParticipate) {
            throw new BadRequestException();
        }

        session.getUsers().add(user);

        this.sessionRepository.save(session);
    }

    public SessionDto update(Long id, SessionDto sessionDto) {
        Session session = this.sessionMapper.toEntity(sessionDto);
        session.setId(id);
        Session updatedSession = this.sessionRepository.save(session);
        return  this.sessionMapper.toDto(updatedSession);
    }

    public void delete(Long id) {
       Session session = getById(id);
        this.sessionRepository.deleteById(session.getId());
    }

    public void noLongerParticipate(Long id, Long userId) {
        Session session = getById(id);
        if (session == null) {
            throw new NotFoundException();
        }

        boolean alreadyParticipate = session.getUsers().stream().anyMatch(o -> o.getId().equals(userId));
        if (!alreadyParticipate) {
            throw new BadRequestException();
        }

        session.setUsers(session.getUsers().stream().filter(user -> !user.getId().equals(userId)).collect(Collectors.toList()));

        this.sessionRepository.save(session);
    }
}
