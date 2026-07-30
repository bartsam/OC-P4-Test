package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.services.SessionService;
import jakarta.validation.Valid;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/session")
@Log4j2
public class SessionController {
    private final SessionService sessionService;


    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDto> findById(@PathVariable("id") String id) {
         return ResponseEntity.ok().body(this.sessionService.getDtoById(Long.valueOf(id)));
    }

    @GetMapping()
    public ResponseEntity<List<SessionDto>> findAll() {
        return ResponseEntity.ok().body(this.sessionService.findAllDto());
    }

    @PostMapping()
    public ResponseEntity<SessionDto> create(@Valid @RequestBody SessionDto sessionDto) {
        return ResponseEntity.ok().body(this.sessionService.create(sessionDto));
    }

    @PostMapping("{id}/participate/{userId}")
    public ResponseEntity<Void> participate(@PathVariable("id") String id, @PathVariable("userId") String userId) {
        this.sessionService.participate(Long.parseLong(id), Long.parseLong(userId));
        return ResponseEntity.ok().build();
    }

    @PutMapping("{id}")
    public ResponseEntity<SessionDto> update(@PathVariable("id") String id, @Valid @RequestBody SessionDto sessionDto) {
        return ResponseEntity.ok().body(this.sessionService.update(Long.valueOf(id), sessionDto));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        this.sessionService.delete(Long.valueOf(id));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("{id}/participate/{userId}")
    public ResponseEntity<Void> noLongerParticipate(@PathVariable("id") String id, @PathVariable("userId") String userId) {
        this.sessionService.noLongerParticipate(Long.parseLong(id), Long.parseLong(userId));
        return ResponseEntity.ok().build();
    }
}
