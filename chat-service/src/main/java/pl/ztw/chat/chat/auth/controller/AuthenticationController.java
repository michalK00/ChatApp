package pl.ztw.chat.chat.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ztw.chat.chat.auth.dto.AuthenticationRequest;
import pl.ztw.chat.chat.auth.dto.RegisterRequest;
import pl.ztw.chat.chat.auth.service.AuthenticationService;
import pl.ztw.chat.chat.dto.UserDTO;
import pl.ztw.chat.chat.security.jwt.JwtToken;

import java.security.Principal;


@RestController
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/public/api/v1/auth/register-user")
    @Operation(summary = "Register user")
    public ResponseEntity<Void> registerParticipant(@RequestBody RegisterRequest request) {
        service.register(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/public/api/v1/auth/authenticate")
    @ExceptionHandler
    public ResponseEntity<JwtToken> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok().body(service.authenticate(request));
    }

    @GetMapping("/public/api/v1/user-details")
    public ResponseEntity<UserDTO> getUser(Principal principal) {
        return ResponseEntity.ok().body(service.getUserDetails(principal.getName()));
    }
}
