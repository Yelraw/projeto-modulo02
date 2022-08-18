const pagseguro = require('./class/pagseguro');
const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const cors = require('cors');
const portaEndpoint = 8081;
const meusEndpoints = express();
meusEndpoints.use(cors());
meusEndpoints.use(bodyParser.json());

meusEndpoints.get('/recuperaToken', (requisicao, resposta) => {
    pagseguro.recuperaToken(requisicao, resposta);
});
meusEndpoints.post('/pagCartaoCredito', (requisicao, reposta) => {
    console.log(requisicao.body);
    pagseguro.solicitarPagCartaoCredito(requisicao, reposta);
})

meusEndpoints.post('/consultarStatusVenda', (requisicao, resposta) => {
    pagseguro.consultarStatusVenda(requisicao, resposta);
})

meusEndpoints.listen(portaEndpoint, ()=>{
    console.log(`Servidor ligado em http://127.0.0.1:${portaEndpoint}`);
})
