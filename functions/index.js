const pagseguro = require('./class/pagseguro');
const cors = require('cors')({
    origin: true
});
const functions = require('firebase-functions');

exports.recuperaToken = functions.https.onRequest((requisicao, resposta) => {
    cors(requisicao, resposta, async () => {
        pagseguro.recuperaToken(requisicao, resposta);
    })
});

exports.pagCartaoCredito = functions.https.onRequest((requisicao, resposta) => {
    cors(requisicao, resposta, async () => {
        pagseguro.solicitarPagCartaoCredito(requisicao, resposta);
    })
});

exports.consultarStatusVenda = functions.https.onRequest((requisicao, resposta) => {
    cors(requisicao, resposta, async ()=> {
        pagseguro.consultarStatusVenda(requisicao, resposta);
    })
});

