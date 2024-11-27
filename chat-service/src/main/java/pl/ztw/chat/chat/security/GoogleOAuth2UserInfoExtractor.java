package pl.ztw.chat.chat.security;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import pl.ztw.chat.chat.enums.Provider;
import pl.ztw.chat.chat.data.User;

import java.util.Optional;

@Service
public class GoogleOAuth2UserInfoExtractor {
    private final String emailAttribute = "email";
    private final String nameAttribute = "name";

    public User extractUserInfo(OAuth2User oAuth2User) {
        return User.builder()
                .email(getAttribute(oAuth2User, emailAttribute))
                .nickname(getAttribute(oAuth2User, nameAttribute))
                .provider(Provider.GOOGLE)
                .isEnabled(true)
                .build();
    }

    private String getAttribute(OAuth2User oAuth2User, String attributeKey) {
        return Optional.ofNullable(oAuth2User.getAttributes().get(attributeKey))
                .map(Object::toString)
                .orElse("");
    }
}