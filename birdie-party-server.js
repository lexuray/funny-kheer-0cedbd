// ============================================================================
// Birdie Blitz — PartyKit server (the entire backend).
// One "room" per 4-digit code. Relays lobby state + shot/hole events between
// the players in that room. Free tier easily covers friends-and-family traffic.
//
// DEPLOY (takes ~5 minutes, free):
//   1. Install Node.js (https://nodejs.org) if you don't have it.
//   2. In a folder, run:   npm create partykit@latest
//        - pick a name like "birdie-blitz"
//   3. Replace the generated src/server.ts (or server.js) with THIS file.
//   4. Run:   npx partykit deploy
//        - it prints a host like  birdie-blitz.<your-username>.partykit.dev
//   5. In the game HTML, set PARTY_HOST to that host and call NET.use('party').
//
// That's it. No servers to maintain, no bill for normal use.
// ============================================================================

export default class BirdieRoom {
  constructor(room) {
    this.room = room;          // room.id === the 4-digit code
    this.players = [];         // [{ id, name, seat, host, ready }]
    this.started = false;
  }

  // assign the next free seat (0..3)
  nextSeat() {
    const taken = new Set(this.players.map(p => p.seat));
    for (let s = 0; s < 4; s++) if (!taken.has(s)) return s;
    return -1;
  }

  broadcast(obj, exceptId) {
    const msg = JSON.stringify(obj);
    for (const conn of this.room.getConnections()) {
      if (exceptId && conn.id === exceptId) continue;
      conn.send(msg);
    }
  }

  playersPayload() {
    return this.players.map(p => ({ id: p.id, name: p.name, seat: p.seat, host: p.host, ready: p.ready }));
  }

  onConnect(conn) {
    // wait for 'hello' before seating
    conn.send(JSON.stringify({ t: 'open', code: this.room.id }));
  }

  onMessage(raw, conn) {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.t === 'hello') {
      if (this.started) { conn.send(JSON.stringify({ t: 'error', message: 'Game already started' })); return; }
      const seat = this.nextSeat();
      if (seat === -1) { conn.send(JSON.stringify({ t: 'error', message: 'Lobby full' })); return; }
      const isHost = this.players.length === 0;     // first in is host
      this.players.push({ id: conn.id, name: (msg.name || 'Player').slice(0, 12), seat, host: isHost, ready: false });
      conn.send(JSON.stringify({ t: 'players', players: this.playersPayload(), you: seat }));
      this.broadcast({ t: 'players', players: this.playersPayload() });
      return;
    }

    const meP = this.players.find(p => p.id === conn.id);
    if (!meP) return;

    switch (msg.t) {
      case 'ready':
        meP.ready = msg.ready !== false;
        this.broadcast({ t: 'players', players: this.playersPayload() });
        break;

      case 'start':
        if (!meP.host) return;                       // only host starts
        this.started = true;
        this.broadcast({ t: 'start', settings: msg.settings, players: this.playersPayload(), seed: (Date.now() & 0xffff) });
        break;

      // gameplay events are relayed verbatim to everyone else
      case 'shot':
        this.broadcast({ t: 'shot', seat: meP.seat, ...msg }, conn.id);
        break;
      case 'hole':
        this.broadcast({ t: 'hole', ...msg }, conn.id);
        break;
      case 'chat':
        this.broadcast({ t: 'chat', from: meP.name, text: String(msg.text || '').slice(0, 140) });
        break;
    }
  }

  onClose(conn) {
    const idx = this.players.findIndex(p => p.id === conn.id);
    if (idx === -1) return;
    const wasHost = this.players[idx].host;
    this.players.splice(idx, 1);
    if (wasHost && this.players.length) this.players[0].host = true;  // promote next player
    this.broadcast({ t: 'left', players: this.playersPayload() });
  }
}
