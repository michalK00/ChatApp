package pl.ztw.chat.chat.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.ztw.chat.chat.security.jwt.JwtToken;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class  AuthenticationResponse {

    private JwtToken token;

}
