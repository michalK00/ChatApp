package pl.ztw.chat.chat.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import pl.ztw.chat.chat.enums.Provider;
import pl.ztw.chat.chat.data.User;
import pl.ztw.chat.chat.exception.UserAlreadyExistsException;
import pl.ztw.chat.chat.repository.UserRepository;
import pl.ztw.chat.chat.security.jwt.JwtService;
import pl.ztw.chat.chat.security.jwt.JwtToken;

@Component
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final GoogleOAuth2UserInfoExtractor userInfoExtractor;
    private final UserRepository userRepository;
    private final JwtService jwtService;


    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        User userDetails = userInfoExtractor.extractUserInfo(oAuth2User);
        handleOAuthPostLogin(userDetails);

        return oAuth2User;
    }

    private JwtToken handleOAuthPostLogin(User userDetails) {
        if (isUserAlreadyRegistered(userDetails.getEmail())) {
            throw new UserAlreadyExistsException(userDetails.getEmail());
        }

        User newUser = createNewUser(userDetails);
        userRepository.save(newUser);

        return jwtService.generateToken(newUser);
    }

    private User createNewUser(User userDetails) {
        return User.builder()
                .email(userDetails.getEmail())
                .nickname(userDetails.getNickname())
                .provider(Provider.GOOGLE)
                .isEnabled(true)
                .build();
    }

    private boolean isUserAlreadyRegistered(String email) {
        return userRepository.existsByEmail(email);
    }
}