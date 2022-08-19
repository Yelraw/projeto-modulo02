const axios = require('axios');
require("dotenv").config()
const urlAPI = process.env.URL_API;
const emailAPI = process.env.EMAIL_API;
const tokenAPI = process.env.TOKEN_API;
const notificationURL = process.env.NOTIFICATION_URL;
const parseString = require('xml2js').parseString;
const parser = require('xml-js');
const db = require('./firebase')

class Pagseguro{
    recuperaToken(requisicao, resposta){
        axios({
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            url: urlAPI + `/v2/sessions?email=${emailAPI}&token=${tokenAPI}`
        }).then((dados) => {
            parseString(dados.data, function(err, result){
                resposta.status(200).json({token: result.session.id[0]});
            })
        }).catch(function (err){
            console.log(err);
            var obj = {
                error: true,
                msg: "Erro ao buscar token",
                descr_erro: err
            }
            resposta.status(500).json(obj);
        })
    }

    solicitarPagCartaoCredito(requisicao, resposta){
        db.collection('vendas').doc(requisicao.body.reference).get().then(function(resultado){
            var valorTotal = 0;
            console.log(resultado.data().itens)
            resultado.data().itens.forEach(prod => {
                valorTotal += prod.qtd * prod.dados.preco_venda 
            })
            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
            var destinatario = resultado.data().destinatario
            var dadosCompra = {}
            dadosCompra.receiverEmail = emailAPI
            dadosCompra.currency = "BRL"
            dadosCompra.extraAmount = "0.00"
            dadosCompra.itemId1 = requisicao.body.itemId1
            dadosCompra.itemDescription1 = "Compra de " + resultado.data().itens.length + " itens"
            dadosCompra.itemAmount1 = valorTotal.toFixed(2);
            dadosCompra.itemQuantity1 = 1
            dadosCompra.reference = requisicao.body.reference
            dadosCompra.notificationURL = notificationURL
            dadosCompra.senderHash = requisicao.body.senderHash
            dadosCompra.senderName = destinatario.nome.toUpperCase()
            var docP = destinatario.cpf
            var celularCompleto = destinatario.celular.replace(/[^0-9]/g, "");
            var ddd = celularCompleto.substr(0, 2)
            var celular = celularCompleto.substr(2, 9)
            dadosCompra.senderCPF = docP.replace(/-/g, "").replace(/\./g, "")
            dadosCompra.senderAreaCode = parseInt(ddd)
            dadosCompra.senderPhone = parseInt(celular)
            dadosCompra.senderEmail = destinatario.email
    
    
            dadosCompra.creditCardToken = requisicao.body.creditCardToken
            dadosCompra.shippingAddressRequired = false
    
            dadosCompra.paymentMode = "default"
            dadosCompra.paymentMethod = "creditCard"
            
            //parcelamento
            if(true){
                dadosCompra.installmentQuantity = 1
                dadosCompra.installmentValue = valorTotal.toFixed(2)
            }else{
    
            }
    
            dadosCompra.creditCardHolderName = destinatario.nome_cartao
            dadosCompra.creditCardHolderCPF = docP.replace(/[^\d]+/g,'') 
            dadosCompra.creditCardHolderBirthDate = "05/08/1998"
            dadosCompra.creditCardHolderAreaCode = parseInt(ddd);
            dadosCompra.creditCardHolderPhone = parseInt(celular)
            dadosCompra.billingAddressStreet = destinatario.logradouro.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            dadosCompra.billingAddressNumber = 0
            dadosCompra.billingAddressComplement = destinatario.complemento.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            dadosCompra.billingAddressDistrict = destinatario.bairro.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            dadosCompra.billingAddressCity = destinatario.cidade.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            dadosCompra.billingAddressPostalCode = parseInt(destinatario.cep.replace(/[^0-9]/g, ""));
            dadosCompra.billingAddressState = destinatario.estado.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            dadosCompra.billingAddressCountry = "BRA"
            console.log(dadosCompra);
    
            axios.post(`${urlAPI}/v2/transactions?email=${emailAPI}&token=${tokenAPI}`, 
            new URLSearchParams(dadosCompra).toString(), config)
            .then((res) =>{
                if(res.status == 200){
                    var xml = res.data;
                    var result = parser.xml2json(xml, {
                        compact: true,
                        sapce: 0
                    });
                    resposta.status(200).send({
                        status: true,
                        result: result
                    })
                }else{
                    console.log("erro", JSON.stringify(res));
                    resposta.status(502).send({
                        status: false,
                        result: null
                    })
                    return
                }
            }).catch((error) => {
                //console.error(JSON.stringify(error))
                console.log(error)
                resposta.status(502).send({
                    status: false,
                    result: null
                })
                return
            })
        }).catch((error) => {
            console.log(error)
            resposta.status(503).send({
                status: false,
                result: "Erro ao buscar venda"
            })
        })
    }

    consultarStatusVenda(requisicao, resposta){
        var not = requisicao.body
        if(typeof not === 'string'){
            not = JSON.parse(not);
        }
        console.log(requisicao.body)

        axios({
            method: 'get',
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=ISO-8859-1'},
            url: urlAPI + `/v3/transactions/notifications/${not.notificationCode}?email=${emailAPI}&token=${tokenAPI}`
        }).then(function(res){
            if(res.status == 200){
                var xml = res.data;
                var result = parser.xml2json(xml, {compact: true, spaces: 0});
                result = JSON.parse(result);
                console.log(result.transaction.status._text);
                console.log("transação: ", result.transaction);
                var idVenda = result.transaction.reference._text;
                if(result.transaction.status._text == "3"){
                    var dt = {}
                    dt.pagamento_confirmado = true;
                    dt.status = "Pagamento Aprovado";
                    db.collection("vendas").doc(idVenda).set(dt, {merge: true}).then(function(){
                        console.log("pagamento realizado com sucesso")
                        resposta.status(200).send({status: "Pagamento Aprovado"})
                    })
                }else if(result.transaction.status._text == "6"){
                    //devolvido
                    resposta.status(500).send({status: "Pagamento Recusado"})
                }else if(result.transaction.status._text == "7"){
                    //cancelado
                    resposta.status(500).send({status: "Pagamento Cancelado"})
                }else{
                    //outros erros
                    resposta.status(500).send({status: "Erro ao pagar"});
                }
            }else{
                resposta.status(500).send({status: "Erro no pagamento"});
            }
        }).catch(function(error){
            console.log(error)
            console.log(requisicao.body)
            resposta.status(500).send({status: "Erro ao receber dados do pagseguro"})
        })        
    }
}

module.exports = new Pagseguro()