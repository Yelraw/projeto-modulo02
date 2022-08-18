$(document).ready(function() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            window.usuarioLogado = user.uid;
            minhasCompras();
        }
    });
})

function minhasCompras() {
    firebase.firestore().collection("vendas").where("comprador", "==", window.usuarioLogado)
    .orderBy("data_venda", "desc")
    .get()
    .then((vendas) => {
        if(vendas.docs){
            for(let venda of vendas.docs){
                if(venda.data().status){
                    var maisItens = ""
                    if(venda.data().itens[1] != null && venda.data().itens[2] != null){
                        maisItens= ", " + venda.data().itens[1].dados.nome + ", ...";
                    }else if(venda.data().itens[1] != null){
                        maisItens= ", " + venda.data().itens[1].dados.nome + ".";
                    }else{
                        maisItens = "."
                    }
                    var qtdItens = 0;
                    var valorTotal = 0;
                    var itens = "";
                    for (let i = 0; i < venda.data().itens.length; i++){
                        qtdItens += venda.data().itens[i].qtd;
                        valorTotal += venda.data().itens[i].dados.preco_venda * venda.data().itens[i].qtd;
                        itens += `
                                    <div class="col-md-2" style=" align-itens: center; text-align: center; align-content: center;">
                                        <img style="width: 70px;" src="${venda.data().itens[i].dados.foto_destaque}">
                                    </div>
                                    <div class="col-md-10">
                                        <b>Produto: </b> ${venda.data().itens[i].dados.nome} <br>
                                        <b>Quantidade:</b> ${venda.data().itens[i].qtd} <br>
                                        <b>Valor Unidade:</b> R$ ${venda.data().itens[i].dados.preco_venda.toLocaleString('pt-br', { minimumFractionDigits: 2 })} <br>
                                        <b>Valor Total: </b> R$ 
                                        ${(venda.data().itens[i].qtd * venda.data().itens[i].dados.preco_venda).toLocaleString('pt-br', { minimumFractionDigits: 2 })} <br>
                                    </div>
                                    <div class="col-md-12">
                                        <hr>
                                    </div>
                                `
                    }
                    var html = `
                            <div class="col-md-2" style=" align-itens: center; text-align: center; align-content: center;">
                                <img style="width: 65%;" src="${venda.data().itens[0].dados.foto_destaque}" alt=""/>
                            </div>
                            <div class="col-md-10">
                                <div class="col-md-12" style="font-size: 18px; margin-botton: 20px">
                                    <div class="col-md-3 offset-md-9">
                                        <button onclick="verDestino(this)" type="button" class="btn btn-warning btnEnderecoVendas" style="float: right;">Mostrar Endereço</button>
                                        <button onclick="verDestino(this)" type="button" class="btn btn-warning btnEnderecoVendas" style="float: right; display: none;">Ocultar Endereço</button> 
                                        <button onclick="verItens(this)" type="button" class="btn btn-warning btnItensVenda" style="float: right; margin-top: 5px;">Mais detalhes</button>
                                        <button onclick="verItens(this)" type="button" class="btn btn-warning btnItensVenda" style="float: right; display: none; margin-top: 5px;">Menos detalhes</button>
                                    </div>    
                                    Itens: <b>${venda.data().itens[0].dados.nome + maisItens}</b><br>
                                    Status: <b style="color: #FF6100;" >${venda.data().status}</b><br>
                                    Data da compra: <b style="color: #FF6100;">${converterData(venda.data().data_venda.seconds * 1000)}</b><br>
                                    Quantidade: <b style="color: #FF6100;" >${qtdItens} produto(s)</b><br>
                                    Total: <b style="color: #FF6100;">R$ ${valorTotal.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</b>
                                    <hr>    
                                </div>
                                <div class="verItensVenda col-md-12" style="display: none">
                                    <div> 
                                        <b>Todos os Itens da compra: </b>
                                        <hr>
                                    </div>
                                    <div class="row">
                                        ${itens}
                                    </div>
                                </div>
                                <div class="verEnderecoVendas col-md-12" style="display: none">
                                <div> 
                                    <b>Endereço de Entrega: </b>
                                    <hr>
                                </div>
                                <div class= col-md-9 offset-md-3>
                                    <b>Nome: </b> ${venda.data().destinatario.nome} <br>
                                    <b>Celular: </b> ${venda.data().destinatario.celular} <br>
                                    <b>Logradouro: </b> ${venda.data().destinatario.logradouro} <br>
                                    <b>Complemento: </b> ${venda.data().destinatario.complemento} <br>
                                    <b>Número: </b> ${venda.data().destinatario.numero} <br>
                                    <b>Bairro: </b> ${venda.data().destinatario.bairro} <br>
                                    <b>Cidade: </b> ${venda.data().destinatario.cidade} <br>
                                    <b>Estado: </b> ${venda.data().destinatario.estado} <br>
                                    <b>Cep: </b> ${venda.data().destinatario.cep} <br>
                                </div>
                                <hr>
                            </div>
                            </div>
                    `
                    $("#minhascompras").append(html);
                }
            }
        }
    })
}

function converterData(data){
    if(data){
        if(typeof data === 'string'){
            data = new Date(data).getTime() + 1 * 24 * 60 * 60 * 1000;
        }
        var date = new Date(data);
    }else{
        var date = new Date();
    }
    var horas = String(date.getHours()).padStart(2, '0');
    var minutos = String(date.getMinutes()).padStart(2, '0');
    var dia = String(date.getDate()).padStart(2, '0');
    var mes = String(date.getMonth() + 1).padStart(2, '0');
    var ano = String(date.getFullYear());
    var dataString = dia + "/" + mes + "/" + ano + " " + horas + ":" + minutos;
    return dataString;
}

function verItens(button){
    $(button).parent().parent().parent().find(".verItensVenda").slideToggle();
    $(button).parent().parent().parent().find(".btnItensVenda").toggle();
}

function verDestino(button){
    $(button).parent().parent().parent().find(".verEnderecoVendas").slideToggle();
    $(button).parent().parent().parent().find(".btnEnderecoVendas").toggle();
}