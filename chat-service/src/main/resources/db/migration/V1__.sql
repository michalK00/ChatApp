CREATE SEQUENCE IF NOT EXISTS _user_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE IF NOT EXISTS message_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE IF NOT EXISTS room_seq START WITH 1 INCREMENT BY 50;

CREATE TABLE _user
(
    id         BIGINT  NOT NULL,
    nickname   VARCHAR(255),
    email      VARCHAR(255),
    password   VARCHAR(255),
    provider   VARCHAR(255),
    is_enabled BOOLEAN NOT NULL,
    CONSTRAINT pk__user PRIMARY KEY (id)
);

CREATE TABLE message
(
    id        BIGINT NOT NULL,
    message   VARCHAR(255),
    timestamp VARCHAR(255),
    username  VARCHAR(255),
    room_id   BIGINT,
    CONSTRAINT pk_message PRIMARY KEY (id)
);

CREATE TABLE room
(
    id   BIGINT NOT NULL,
    name VARCHAR(255),
    CONSTRAINT pk_room PRIMARY KEY (id)
);

CREATE TABLE room_participant
(
    room_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL
);

ALTER TABLE message
    ADD CONSTRAINT FK_MESSAGE_ON_ROOM FOREIGN KEY (room_id) REFERENCES room (id);

ALTER TABLE room_participant
    ADD CONSTRAINT fk_roopar_on_room FOREIGN KEY (room_id) REFERENCES room (id);

ALTER TABLE room_participant
    ADD CONSTRAINT fk_roopar_on_user FOREIGN KEY (user_id) REFERENCES _user (id);