const CronJob = require('cron').CronJob;
const totalvoice = require('totalvoice-node');
const rpi = require('raspi-ver');
const disk = require('diskusage');
const os = require('os');
const pretty = require('prettysize');

require('dotenv').config();

const TOKEN = process.env.TOTALVOICE_TOKEN || '';
const TELEFONE = process.env.TELEFONE || '';

const client = new totalvoice(TOKEN);
const path = os.platform() === 'win32' ? 'c:' : '/storage';

var job = new CronJob({
  cronTime: '00 00 9,14,22 * * *',
  onTick: function() {
    let info = disk.checkSync(path);
    let newinfo = {
      free: pretty(info.free),
      available: pretty(info.available)
    };
    let status = Object.assign(rpi, newinfo);

    delete status.revision;
    delete status.total;
    delete status.notes;

    client.sms.enviar(TELEFONE, JSON.stringify(status))
        .then(function (data) {
            console.log(data)
    })
    .catch(function (error) {
        console.error('Erro: ', error)
    });
  },
  start: false,
  timeZone: 'America/Sao_Paulo'
});
job.start();

