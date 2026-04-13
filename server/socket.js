module.exports = function attachSocket(io, sessions, mbti) {
  io.on('connection', (socket) => {
    socket.emit('state', {
      counts: sessions.getCurrentCounts(),
      colors: mbti.MBTI_COLORS,
      total: sessions.getCurrentTotal(),
      session: sessions.getActive(),
    });

    socket.on('submit_mbti', (data) => {
      const mbtiKey = (data.mbti || '').toUpperCase().trim();
      if (!mbti.MBTI_COLORS[mbtiKey]) return;

      const { counts, total } = sessions.incrementMbti(mbtiKey);

      const payload = {
        mbti: mbtiKey,
        color: mbti.MBTI_COLORS[mbtiKey],
        nickname: mbti.MBTI_NAMES[mbtiKey],
        luckyPhrase: mbti.MBTI_LUCKY_PHRASES[mbtiKey],
        count: counts[mbtiKey],
      };

      socket.emit('lucky_color', payload);
      io.emit('spawn_particles', { ...payload, counts, total });

      console.log(`[+] ${mbtiKey} (${mbti.MBTI_NAMES[mbtiKey]}) joined — total: ${total}`);
    });
  });
};
