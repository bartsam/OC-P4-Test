package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.services.SessionService;
import jakarta.validation.Valid;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/session")
@Log4j2
public class SessionController {
    private final SessionService sessionService;
    private final SessionMapper sessionMapper;


    public SessionController(SessionService sessionService, SessionMapper sessionMapper) {
        this.sessionService = sessionService;
        this.sessionMapper = sessionMapper;
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDto> findById(@PathVariable("id") String id) {
        Session session = sessionService.getById(Long.valueOf(id));
        SessionDto response = sessionMapper.toDto(session);
        return ResponseEntity.ok().body(response);
    }

    @GetMapping()
    public ResponseEntity<List<SessionDto>> findAll() {
        List<Session> sessions = sessionService.findAll();
        List<SessionDto> response = sessionMapper.toDto(sessions);
        return ResponseEntity.ok().body(response);
    }

    @PostMapping()
    public ResponseEntity<SessionDto> create(@Valid @RequestBody SessionDto sessionDto) {
        Session session = sessionMapper.toEntity(sessionDto);
        Session created = sessionService.create(session);
        SessionDto response = sessionMapper.toDto(created);
        return ResponseEntity.ok().body(response);
    }

    @PutMapping("{id}")
    public ResponseEntity<SessionDto> update(@PathVariable("id") String id, @Valid @RequestBody SessionDto sessionDto) {
        Session session = sessionMapper.toEntity(sessionDto);
        Session updated = sessionService.update(Long.valueOf(id), session);
        SessionDto response = sessionMapper.toDto(updated);
        return ResponseEntity.ok().body(response);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        this.sessionService.delete(Long.valueOf(id));
        return ResponseEntity.ok().build();
    }

    @PostMapping("{id}/participate/{userId}")
    public ResponseEntity<Void> participate(@PathVariable("id") String id, @PathVariable("userId") String userId) {
        this.sessionService.participate(Long.parseLong(id), Long.parseLong(userId));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("{id}/participate/{userId}")
    public ResponseEntity<Void> noLongerParticipate(@PathVariable("id") String id, @PathVariable("userId") String userId) {
        this.sessionService.noLongerParticipate(Long.parseLong(id), Long.parseLong(userId));
        return ResponseEntity.ok().build();
    }
}
