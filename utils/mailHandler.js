async function sendMail(to, subject, html = '') {
  return {
    accepted: [to],
    subject,
    html,
    message: 'Mail handler scaffold is ready for future integration.',
  };
}

module.exports = {
  sendMail,
};
