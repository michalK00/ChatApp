package pl.ztw.chat.chat.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import pl.ztw.chat.chat.enums.Provider;
import pl.ztw.chat.chat.data.User;
import pl.ztw.chat.chat.enums.UserStatus;
import pl.ztw.chat.chat.repository.UserRepository;
import pl.ztw.chat.chat.security.jwt.JwtService;

import java.io.IOException;

@RequiredArgsConstructor
@Component
public class CustomAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService tokenProvider;
    private final UserRepository userRepository;

    @Value("${oauth2.google.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        handle(request, response, authentication);
        super.clearAuthenticationAttributes(request);
    }

    @Override
    protected void handle(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        String targetUrl = redirectUri.isEmpty() ?
                determineTargetUrl(request, response, authentication) : redirectUri;

        User user = userRepository.findByEmail(extractEmail(authentication)).orElse(createNewUser(extractEmail(authentication), extractFirstName(authentication)));
        String token = tokenProvider.generateToken(user).token();
        targetUrl = UriComponentsBuilder.fromUriString(targetUrl).queryParam("token", token).build().toUriString();
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String extractEmail(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        return principal instanceof OidcUser oidcUser ? oidcUser.getEmail() : null;
    }

    private String extractFirstName(Authentication authentication) {
        String details = authentication.getPrincipal().toString();
        String namePrefix = " name=";
        int startIndex = details.indexOf(namePrefix);
        if (startIndex == -1) return null;

        startIndex += namePrefix.length();
        int endIndex = details.indexOf(',', startIndex);
        if (endIndex == -1) endIndex = details.indexOf('}', startIndex);

        return endIndex != -1 ? details.substring(startIndex, endIndex).trim() : null;
    }

    private User createNewUser(String email, String nickname) {
        User newUser = User.builder()
                .email(email)
                .provider(Provider.GOOGLE)
                .isEnabled(true)
                .nickname(nickname)
                .status(UserStatus.INACTIVE)
                .build();
        return userRepository.save(newUser);
    }
}