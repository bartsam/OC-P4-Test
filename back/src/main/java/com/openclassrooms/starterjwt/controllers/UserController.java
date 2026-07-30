package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> findById(@PathVariable("id") String id) {
        UserDto userDto = this.userService.findDtoById(Long.valueOf(id));
        return ResponseEntity.ok().body(userDto);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> save(@PathVariable("id") String id) {
        this.userService.deleteIfOwner(Long.valueOf(id));
        return ResponseEntity.ok().build();
    }
}
