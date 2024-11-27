export const environment = {
  envVar: {
    API_BASE_URL: '<!--# echo var="api_base_url" -->',
    BROKER_URL: '<!--# echo var="broker_url" -->',
    OAUTH2_REDIRECT_URI: '<!--# echo var="oauth2_redirect_uri" -->',
    ICE_SERVERS: [
      {
        urls: '<!--# echo var="stun_url" -->',
      },
      {
        urls: '<!--# echo var="turn_url_1" -->',
        username: '<!--# echo var="turn_username" -->',
        credential: '<!--# echo var="turn_credential" -->',
      },
      {
        urls: '<!--# echo var="turn_url_2" -->',
        username: '<!--# echo var="turn_username" -->',
        credential: '<!--# echo var="turn_credential" -->',
      },
      {
        urls: '<!--# echo var="turn_url_3" -->',
        username: '<!--# echo var="turn_username" -->',
        credential: '<!--# echo var="turn_credential" -->',
      },
      {
        urls: '<!--# echo var="turn_url_4" -->',
        username: '<!--# echo var="turn_username" -->',
        credential: '<!--# echo var="turn_credential" -->',
      },
    ],
  },
};
