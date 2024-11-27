package pl.ztw.chat.chat.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.ztw.chat.chat.auth.dto.AuthenticationRequest;
import pl.ztw.chat.chat.auth.dto.RegisterRequest;
import pl.ztw.chat.chat.enums.Provider;
import pl.ztw.chat.chat.data.User;
import pl.ztw.chat.chat.dto.UserDTO;
import pl.ztw.chat.chat.enums.UserStatus;
import pl.ztw.chat.chat.repository.UserRepository;
import pl.ztw.chat.chat.security.jwt.JwtService;
import pl.ztw.chat.chat.security.jwt.JwtToken;

@RequiredArgsConstructor
@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public void register(RegisterRequest request) {
        checkIfUserWithEmailExists(request.getEmail());
        var user = User.builder()
                .nickname(request.getNickname())
                .email(request.getEmail())
                .provider(Provider.LOCAL)
                .isEnabled(true)
                .status(UserStatus.INACTIVE)
                .build();

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }

    private void checkIfUserWithEmailExists(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with email " + email + " already exists");
        }
    }

    public JwtToken authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        return jwtService.generateToken(user);
    }


    public UserDTO getUserDetails(String username) {
        var user = userRepository.findByEmail(username).orElseThrow();
        return UserDTO.toUserDTO(user);
    }

    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }
}
