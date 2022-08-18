$(document).ready(function() {
    if(location.path == "/carrinho.html"){
        $('#celular-carrinho').mask('(99) 99999-9999');
        $('#celular-destinatario').mask('(99) 99999-9999');
        $('#celular-login').mask('(99) 99999-9999');
        $("#cep").mask('99999-999');
    }else{
        $('#celular-login').mask('(99) 99999-9999');
        $("#cep").mask('99999-999');
        $("#cpf").mask('999.999.999-99');
    }
    $("#cartao-numero").mask('9999 9999 9999 9999');
    $("#cartao-validade").mask('99/9999');
    $("#cartao-cpf").mask('999.999.999-99');
    window.captchaDeSeguranca = new firebase.auth.RecaptchaVerifier('enviar-codigo', {
        'size': 'invisible',
        'callback': (response) => {
          //onSignInSubmit();
        }
      });
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            window.usuarioLogado = user.uid;
            $("#usuario-logado").show();
            $("#usuario-deslogado").hide();
            logadoComSucesso();
        } else {
            $("#usuario-logado").hide();
            $("#usuario-deslogado").show();
        }
    });
    $("#cep").on('change', function(){
        var cep = $("#cep").val().replace("-", "");
        var urlApiCep = "https://viacep.com.br/ws/" + cep + "/json/?callback=?";
        $.getJSON(urlApiCep, function (resultado) {
            if (!("erro" in resultado)) {
                $("#logradouro").val(resultado.logradouro).prop('disabled', true);
                $("#bairro").val(resultado.bairro).prop('disabled', true);
                $("#cidade").val(resultado.localidade).prop('disabled', true);
                $("#estado").val(resultado.uf).prop('disabled', true);
            } else {
                new Swal("Erro!", "Não foi possível buscar este CEP", "error");
            }
        })
    });
    recuperaCarrinho();
})

function salvarDestinatario() {
    var carrinho = localStorage.getItem('carrinho');
    if(!carrinho){
        var carrinho = {
            itens: []
        }
    }else{
        carrinho = JSON.parse(carrinho);
    }

    if(carrinho.itens.length == 0){
        new Swal("Atenção", 'Selecione ao menos um produto para prosseguir', 'error');
        return
    }

    var camposObrigatorios = false;
    $('.obrigatorio').each(function () {
        if ($(this).val() == "") {
            camposObrigatorios = true;
        }
    })

    if (camposObrigatorios) {
        new Swal("Atenção!", 'Por favor preencha todos os campos com "*" para prosseguir', "warning");
        return;
    }

    var destinatario = {
        nome: $("#nome-destinatario").val(),
        celular: $("#celular-destinatario").val(),
        email: $("#email-destinatario").val(),
        cep: $("#cep-destinatario").val(),
        logradouro: $("#logradouro-destinatario").val(),
        numero: $("#numero-destinatario").val(),
        complemento: $("#complemento-destinatario").val(),
        bairro: $("#bairro-destinatario").val(),
        cidade: $("#cidade-destinatario").val(),
        estado: $("#estado-destinatario").val()
    }

    var venda = {
        itens: carrinho.itens,
        destinatario: destinatario,
        comprador: window.usuarioLogado,
        data_venda: new Date()
    }
    if(localStorage.getItem('idVendaAtual')){
        firebase.firestore().collection('vendas').doc(localStorage.getItem('idVendaAtual')).set(venda, {merge: true}).then(function (){
            sucessoVenda(localStorage.getItem('idVendaAtual'));
        })
    }else{
        firebase.firestore().collection('vendas').add(venda).then(function (resultado) {
            window.idVendaAtual = resultado.id
            localStorage.setItem('idVendaAtual', idVendaAtual);
            sucessoVenda(resultado.id);
        })
    }

}

function sucessoVenda(id){
    new Swal({
        title: "Sucesso!",
        icon: "success",
        confirmButtonText: "Realizar Pagamento",
        html: `Seu pedido foi gerado com o seguinte código <br><b>${id}</b>"
                clique no botão "Realizar Pagamento" para prosseguir com o pagamento
            `
    }).then(function () {
        getSessao();
        $('.btn-etapa').hide();
        $('.btn-etapa-3').show();
        $('.etapas').removeClass('etapa-ativa');
        $('.etapa-3').addClass('etapa-ativa');
        $('.compra_modal').hide();
        $('#compra_pagamento').show();
    })
}

function salvarCliente(){
    var camposObrigatorios = false;
    $('.obrigatorio').each(function () {
        if ($(this).val() == "") {
            camposObrigatorios = true;
        }
    })

    if (camposObrigatorios) {
        new Swal("Atenção!", 'Por favor preencha todos os campos com "*" para prosseguir', "warning");
        return;
    }

    var cliente = {
        nome: $("#nome").val(),
        cpf: $("#cpf").val(),
        email: $("#email").val(),
        cep: $("#cep").val(),
        logradouro: $("#logradouro").val(),
        numero: $("#numero").val(),
        complemento: $("#complemento").val(),
        bairro: $("#bairro").val(),
        cidade: $("#cidade").val(),
        estado: $("#estado").val()
    }
    firebase.firestore().collection("login").doc(window.usuarioLogado).set(cliente, {merge: true}).then(function (){
        new Swal({
            title: "Concluído!",
            icon: "success",
            text: "Dados salvos com sucesso!"
        }).then(function(){
            location.reload();
        })
    })    
}

function recuperaCarrinho(){
    $('.qtd-carrinho').html('');
    var carrinho = localStorage.getItem('carrinho');
    if(!carrinho){
        var carrinho = {
            itens: []
        }
    }else{
        carrinho = JSON.parse(carrinho);
    }
    listarItemCarrinho();
}

function listarItemCarrinho(){
    carrinho = JSON.parse(localStorage.getItem('carrinho'));
        if(localStorage.getItem('idVendaAtual')){
            firebase.firestore().collection("vendas").doc(localStorage.getItem('idVendaAtual')).get().then(function(resultado){
                if(resultado.status != "Aguardando Pagamento" && resultado.status != null){
                    new Swal({
                        title: 'Atenção!',
                        text: "Existe uma venda em aberto, deseja continuar o pagamento, ou encerrar o processo?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#277be3',
                        cancelButtonColor: '#c92c2c',
                        confirmButtonText: 'Continuar a Compra',
                        cancelButtonText: 'Cancelar a Compra'
                    }).then((result) => {
                        window.idVendaAtual = localStorage.getItem('idVendaAtual');
                        if(result.isConfirmed){
                            continuarCompra(carrinho);
                        }else{
                            cancelarCompra(carrinho);
                        }
                    })
                }else{
                    localStorage.clear();
                    window.idVendaAtual = null;
                    continuarCompra(carrinho);
                }
            })
        }else{
            continuarCompra(carrinho);
        }
}

function continuarCompra(carrinho){
    var valorTotal = 0;
    var itens = 0;
    if(carrinho != null){
        $('#itens-carrinho').html('');
        $.each(carrinho.itens, function(i, prod){
            valorTotal += (prod.dados.preco_venda * prod.qtd);
            itens += prod.qtd;
            var html = `
                <div class="col-md-1 item-${i}">
                    <img style="width: 100%;" src="${prod.dados.foto_destaque}" alt=""/>
                </div>
                <div class="col-md-11 item-${i}" style="font-size: 18px;">
                    <button onclick="removerItem(${i})" type="button" class="btn btn-danger" style="float: right;">Remover</button>
                    Itens: <b>${prod.dados.nome}</b><br>
                    Quantidade: <b style="color: #FF6100;" >${prod.qtd} unidade(s)</b><br>
                    Total: <b style="color: #FF6100;">R$ ${(prod.dados.preco_venda * prod.qtd).toLocaleString('pt-br', { minimumFractionDigits: 2 })}</b>
                    <hr>    
                </div>   
            `
            $('#itens-carrinho').append(html)
        })
        $('.qtd-carrinho').html(itens);
        $('#valor-total').html("R$ " + valorTotal.toLocaleString('pt-br', { minimumFractionDigits: 2 }))
    }else{
        $('.qtd-carrinho').html("0");
    }
}

function cancelarCompra(){
    console.log(localStorage.getItem('idVendaAtual'))
    var obj = {
        status: 'Compra Cancelada'
    }
    firebase.firestore().collection('vendas').doc(localStorage.getItem('idVendaAtual')).set(obj, {merge: true}).then(function(){
        new Swal("Sucesso!", 'Venda cancelada!', 'success');
        localStorage.clear();
        window.idVendaAtual = null;
    })
}

function removerItem(item){
    var carrinho = JSON.parse(localStorage.getItem('carrinho'));
    carrinho.itens.splice(item, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho))
    listarItemCarrinho();
}

function enviarCodCelular(){
    var celular = "";
    if(location.pathname == "/carrinho.html"){
        var nome = $('#nome-carrinho').val();
        if($('#celular-login').val() == ""){
            if($('#celular-carrinho').val() != ""){
                celular = $('#celular-carrinho').val();
            }
        }else{
            celular = $('#celular-login').val();
        }
        if($('#celular-carrinho').val() != "" && $('#celular-login').val() == ""){
            if(nome == ""){
                new Swal("Atenção!", 'Por favor preencha o campo nome para prosseguir!', 'error');
                return;
            }
        }
        if(celular == ""){
            new Swal("Atenção!", 'Por favor preencha o campo celular para prosseguir!', 'error');
            return;
        }
    }else{
        celular = $('#celular-login').val();
        if(celular == ""){
            new Swal("Atenção!", 'Por favor preencha o campo celular para prosseguir!', 'error');
            return;
        }
    }
    const validacaoCaptcha = window.captchaDeSeguranca;
    firebase.auth().signInWithPhoneNumber('+55' + celular.replace(/\D/g,''), validacaoCaptcha)
        .then((resultadoConfirmado) => {
            $('#codigo-login').prop('disabled', false);
            $('#codigo-carrinho').prop('disabled', false);
            $('.btn-etapa-1').show();
            new Swal('Sucesso!', "Enviamos um SMS de confirmação para seu celular", 'success')
            window.resultadoConfirmado = resultadoConfirmado;
        }).catch((error) => {
            new Swal('Erro!', `Não foi possível enviar o SMS: <br> ${error}`, 'error')
    });
}

function validarCodigo(){
    var codigo = "";
    if($('#codigo-login').val() == ""){
        if($('#codigo-carrinho').val().val() != ""){
            codigo = $('#codigo-carrinho').val();
        }
    }else{
        codigo = $('#codigo-login').val();
    }
    if(codigo == ""){
        new Swal("Atenção", 'Por favor preencha o código recebido por SMS para prosseguir!', 'error')
        return
    }
    window.resultadoConfirmado.confirm(codigo).then((resultado) => {
        const usuario = resultado.user;
        var celular = "";
        var dadosLogin = {}
        if($('#celular-login').val() == ""){
            if($('#celular-carrinho').val() != ""){
                celular = $('#celular-carrinho').val();
                dadosLogin.nome = $('#nome-carrinho').val();
            }
        }else{
            celular = $('#celular-login').val();
        }
        dadosLogin.celular = celular;
        firebase.firestore().collection('login').doc(usuario.uid).set(dadosLogin, {merge: true}).then((dadosCliente) => {
            new Swal("Sucesso", 'Código verificado com sucesso!', "success").then(() => {
                if(location.pathname != "/carrinho.html"){
                    if(!dadosCliente.exists){
                        new Swal("Por favor!", 'Finalize os dados do seu cadastro para continuar!', "info").then(()=>{
                            $("#celular").val(dadosCliente.data().celular ? dadosCliente.data().celular : "");
                            $("#celular").prop('disabled', true);
                            $("#modal_dadosPessoais").modal('show');
                        })
                    }
                }
            });
            $("#modal_login").modal('hide');
        })
    }).catch((error) => {
        new Swal("Erro!", "Não foi possível fazer login!", "error");
    });
}

function logadoComSucesso(){
    $("#cep-destinatario").mask('99999-999');
    $('.btn-etapa').hide();
    $('.btn-etapa-2').show();
    $('.etapas').removeClass('etapa-ativa');
    $('.etapa-2').addClass('etapa-ativa');
    $('.compra_modal').hide();
    $('#compra_dados_cadastrais').show();
    firebase.firestore().collection("login").doc(window.usuarioLogado).get().then(function(dadosCliente){
        if(dadosCliente.exists && dadosCliente.data().nome){
            $("#nome").val(dadosCliente.data().nome ? dadosCliente.data().nome : "");
            $("#nome-destinatario").val(dadosCliente.data().nome ? dadosCliente.data().nome : "");
            $("#cpf").val(dadosCliente.data().cpf ? dadosCliente.data().cpf : "");
            $("#cpf-destinatario").val(dadosCliente.data().cpf ? dadosCliente.data().cpf : "");
            $("#celular").val(dadosCliente.data().celular ? dadosCliente.data().celular : "");
            $("#celular-destinatario").val(dadosCliente.data().celular ? dadosCliente.data().celular : "");
            $("#celular").prop('disabled', true);
            $("#celular-destinatario").prop('disabled', true);
            $("#email").val(dadosCliente.data().email ? dadosCliente.data().email : "");
            $("#email-destinatario").val(dadosCliente.data().email ? dadosCliente.data().email : "");
            $("#cep").val(dadosCliente.data().cep ? dadosCliente.data().cep : "");
            $("#cep-destinatario").val(dadosCliente.data().cep ? dadosCliente.data().cep : "");
            $("#logradouro").val(dadosCliente.data().logradouro ? dadosCliente.data().logradouro : "");
            $("#logradouro-destinatario").val(dadosCliente.data().logradouro ? dadosCliente.data().logradouro : "");
            $("#numero").val(dadosCliente.data().numero ? dadosCliente.data().numero : "");
            $("#numero-destinatario").val(dadosCliente.data().numero ? dadosCliente.data().numero : "");
            $("#complemento").val(dadosCliente.data().complemento ? dadosCliente.data().complemento : "");
            $("#complemento-destinatario").val(dadosCliente.data().complemento ? dadosCliente.data().complemento : "");
            $("#bairro").val(dadosCliente.data().bairro ? dadosCliente.data().bairro : "");
            $("#bairro-destinatario").val(dadosCliente.data().bairro ? dadosCliente.data().bairro : "");
            $("#cidade").val(dadosCliente.data().cidade ? dadosCliente.data().cidade : "");
            $("#cidade-destinatario").val(dadosCliente.data().cidade ? dadosCliente.data().cidade : "");
            $("#estado").val(dadosCliente.data().estado ? dadosCliente.data().estado : "");
            $("#estado-destinatario").val(dadosCliente.data().estado ? dadosCliente.data().estado : "");
           
            var nomeDividido = dadosCliente.data().nome.split(' ');
            var ultimoNome = nomeDividido[nomeDividido.length - 1]
            var primeiroNome = nomeDividido[0];
            $("#navbarDropdownMenuLink").html("Bem vindo! " + primeiroNome + " " + ultimoNome);
        }else{
            new Swal("Por favor!", 'Finalize os dados do seu cadastro para continuar!', "info").then(()=>{
                $("#celular").val(dadosCliente.data().celular ? dadosCliente.data().celular : "");
                $("#celular").prop('disabled', true);
                $("#modal_dadosPessoais").modal('show');
            });
        }
    })
}

function encerrarSessao(){
    firebase.auth().signOut().then( () => {

    }).catch((error) => {

    })
}

function buscarCep() {
    var cep = $("#cep-destinatario").val().replace("-", "");
    var urlApiCep = "https://viacep.com.br/ws/" + cep + "/json/?callback=?";
    $.getJSON(urlApiCep, function (resultado) {
        if (!("erro" in resultado)) {
            $("#logradouro-destinatario").val(resultado.logradouro).prop('disabled', true);
            $("#bairro-destinatario").val(resultado.bairro).prop('disabled', true);
            $("#cidade-destinatario").val(resultado.localidade).prop('disabled', true);
            $("#estado-destinatario").val(resultado.uf).prop('disabled', true);
        } else {
            new Swal("Erro!", "Não foi possível buscar este CEP", "error");
        }
    })
}
function tentarPagamentoNovamente(){
    new Swal({
        title: 'Algo deu errado!',
        text: "Ocorreu um erro com seu pagamento, por favor tente novamente!",
        icon: 'error',
        confirmButtonText: 'Tentar Novamente',
    }).then((result) => {
        location.reload();
    })
}

function getSessao(){
    var myHeaders = new Headers();

    var myInit = { method: 'GET',
                headers: myHeaders,
                mode: 'cors',
                cache: 'default' };

    fetch('https://us-central1-projeto-academia-warley.cloudfunctions.net/recuperaToken',myInit)
    .then(function(response) {
        return response.json();
    })
    .then(function(dados) {
       console.log("Token da nossa api: ", dados)
       if(dados.error){
            tentarPagamentoNovamente();
            return;
       }
       PagSeguroDirectPayment.setSessionId(dados.token);
       console.log("token foi setado no PagSeguro")
       PagSeguroDirectPayment.getPaymentMethods({
           amount: 10.00,
           success: function(response){
                console.log("Meios de pagamento: ", response);
                PagSeguroDirectPayment.onSenderHashReady(function(response){
                    if(response.status == 'error'){
                        console.error(response.message);
                        return false;
                    }
                    window.hashComprador = response.senderHash;
                    console.log("Hash do comprador Recuperada");
                })
           },
           error: function(response){
                console.error(response);
           },
           complete: function(response){

           }
       })
    }).catch(function(error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
        tentarPagamentoNovamente();
    })
}
function getBandeiraCartao(){
    var numeroCartao = (document.getElementById("cartao-numero").value).replace(" ", "");
    PagSeguroDirectPayment.getBrand({
        cardBin: parseInt(numeroCartao.substr(0, 6)),
        success: function(response){
            console.log("Bandeira: ", response)
            window.bandeiraCartao = response.brand.name
        },
        error: function(response){
            tentarPagamentoNovamente();
            console.error(response)
        },
        complete: function(response){
            //tratamento...
        }
    })
}
function getQtdParcelas(){
    PagSeguroDirectPayment.getInstallments({
        amount: 500,
        maxInstallmentNoInterest: 2,
        brand: window.bandeiraCartao,
        success: function(response){
            console.log('Parcelas', response)
        },
        error: function(response){
            console.error(response);
            tentarPagamentoNovamente();
        },
        complete: function(){
            //callback...
        }
    })
}

function solicitarPagamento(){
    var numeroCartao = document.getElementById("cartao-numero").value;
    var validadeCartao = document.getElementById("cartao-validade").value.split("/");
    var nomeNoCartao = document.getElementById("cartao-nome").value;
    var cpfCartao = document.getElementById("cartao-cpf").value;
    var codCartao = document.getElementById("cartao-codigo").value;
    var dados= {
        destinatario: {
            cpf: cpfCartao,
            nome_cartao: nomeNoCartao
        }
    }
    $('.btn-etapa').hide();
    $('.etapas').removeClass('etapa-ativa');
    $('.etapa-4').addClass('etapa-ativa');
    $('.compra_modal').hide();
    $('#compra_confirmacao').show();
    firebase.firestore().collection("vendas").doc(window.idVendaAtual).set(dados, {merge: true}).then(() => {
        PagSeguroDirectPayment.createCardToken({
            cardNumber: numeroCartao,
            brand: window.bandeiraCartao,
            cvv: codCartao,
            expirationMonth: validadeCartao[0],
            expirationYear: validadeCartao[1],
            success: function(response){
                firebase.firestore().collection("vendas").doc(window.idVendaAtual).onSnapshot((venda) => {
                    console.log("Chegou no snapshot");
                    if(venda.data().pagamento_confirmado &&  venda.data().status == "Pagamento Aprovado"){
                        $(".compra_status").hide();
                        $("#pagamento_aprovado").show();
                        localStorage.clear();
                    }
                })
                console.log("Cartão criptografado: ", response);
    
                var dadosComprador = {
                    senderHash: window.hashComprador,
                    creditCardToken: response.card.token,
                    itemId1: 3,
                    reference: window.idVendaAtual,
                };
                fetch('https://us-central1-projeto-academia-warley.cloudfunctions.net/pagCartaoCredito', {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors',
                    cache: 'default',  
                    body: JSON.stringify(dadosComprador)
                }).then(function(res){ return res.json(); })
                .then(function(data){ 
                    console.log("Deu Certo", data); 
                    if(data.error){
                        tentarPagamentoNovamente();
                        return;
                    }
                    firebase.firestore().collection("vendas").doc(window.idVendaAtual).set({status: "Aguardando Pagamento"}, {merge: true}).then(() => {
                        //talvez fazer algo aqui
                    })
                })
                .catch(function(err){ 
                    console.log(err)
                    tentarPagamentoNovamente();
                })
            },
            error: function(response){
                console.error(response)
            },
            complete: function(response){
    
            }
        })
    })
}

function realizarPagamento(){
    if($("#cartao-numero").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Numero do cartão" para prosseguir', 'error');
        return;
    }
    if($("#cartao-nome").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Nome no cartão" para prosseguir', 'error');
        return;
    }
    if($("#cartao-cpf").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "CPF do titular" para prosseguir', 'error');
        return;
    }
    if($("#cartao-validade").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Validade do Cartão" para prosseguir', 'error');
        return;
    }
    if($("#cartao-validade").val().length < 7){
        new Swal("Atenção", 'Por favor preencha o campo "Validade do Cartão" corretamente para prosseguir', 'error');
        return;
    }
    if($("#cartao-codigo").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Código do cartão (CVV)" para prosseguir', 'error');
        return;
    }
    if($('#cartao-numero').val().split(" ").length < 2){
        new Swal("Atenção", 'Por favor preencha o campo "Numero do cartão" corretamente para prosseguir', 'error');
        return;
    }
    solicitarPagamento();
}
