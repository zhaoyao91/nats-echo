# NATS Echo

Echo NATS messages.

## Features

- easy to use
- compact and pretty display with colors
- support connecting to nats cluster

## NPM Example

```
npm i -g nats-echo

nats-echo --url=nats:xxxx:4222
```

## Docker Example

```
docker run --network=host -it --rm zhaoyao91/nats-echo --mode=system
```

## Options

- `url = "nats://localhost:4222"` - specify nats url
- `topic = ">"` - specify topic to subscribe
- `mode = "user"` - "user" or "system"
  - user mode:
    - every message is logged in two lines
    - message log is colorful
    - reconnect on start
  - system mode:
    - every message is logged in one line
    - message log is not colorful
    - do not reconnect on start

## License

MIT