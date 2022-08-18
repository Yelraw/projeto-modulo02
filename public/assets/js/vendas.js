$(document).ready(function () {
    window.tabelaVendas = $("#tabela_vendas").DataTable({
        "language": {
            "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Portuguese-Brasil.json"
        }
    });

    $(".nav_tab").on('click', function () {
        $(".nav_tab").removeClass('active');
        $(this).addClass('active');
        $(".row_tab").hide();
        var idRow = $(this).attr("href");
        $(idRow).show();
    })
    var dh = new Date();

    var dataIni = `${dh.getFullYear()}-${("0" + (dh.getMonth() + 1)).slice(-2)}-${parseInt((("0" + dh.getDate()).slice(-2))) - 1}`;
    var dataFim = `${dh.getFullYear()}-${("0" + (dh.getMonth() + 1)).slice(-2)}-${parseInt((("0" + dh.getDate()).slice(-2))) + 1}`;
    $("#data_inicial").val(dataIni);
    $("#data_final").val(dataFim);
    firebase.auth().onAuthStateChanged(function (usuarioLogado) {
        if (usuarioLogado) {
            buscarVendas();
            $('#navbarDropdownMenuLink').html(usuarioLogado.email);
            $('#load').hide();
        } else {
            location.href = "./index.html";
        }
    })
})

function buscarVendas() {
    var dataIni = $("#data_inicial").val();
    dataIni = new Date(dataIni);

    var dataFim = $("#data_final").val();
    dataFim = new Date(dataFim);

    firebase.firestore().collection("vendas")
        .where("data_venda", ">", dataIni).where("data_venda", "<", dataFim).get().then(function (vendas) {
            window.tabelaVendas.clear();
            window.tabelaVendas.draw(false);
            var precoVenda = 0;
            var precoCompra = 0;
            for (let venda of vendas.docs) {
                firebase.firestore().collection("login").doc(venda.data().comprador).get().then(function(comprador){
                    var valorCompra = 0;
                    var valorVenda = 0;
                    var dv = venda.data().data_venda.toDate();
                    var dia = dv.getDate().toString().padStart(2, '0');
                    var mes = (dv.getMonth() + 1).toString().padStart(2, '0');
                    dv = `${dia}-${mes}-${dv.getFullYear()}-${dv.getHours()}-${dv.getMinutes()}`;
                    var status = (venda.data().status != null ? venda.data().status : "Aguardando Confirmação");
                    $.each(venda.data().itens, function(){
                        valorCompra += this.qtd * this.dados.preco_compra;
                        valorVenda += this.qtd * this.dados.preco_venda;
                    });
                    window.tabelaVendas.row.add([
                        `${venda.id}<br><b style="white-space: nowrap;">${status}</b>`,
                        dv,
                        `${comprador.data().nome}<br><b style="color: #FF6100">${venda.data().itens.length} Produto(s)</b>`,
                        `${valorVenda.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`,
                        `<i style="cursor: pointer;" onclick="verVenda('${venda.id}')" class="fas fa-eye"></i>`
                    ]).node().id= venda.id;
                    window.tabelaVendas.draw(false);
                    precoVenda += valorVenda;
                    precoCompra += valorCompra;
                    var precoLucro = precoVenda - precoCompra;
                    $("#total_vendido").html("R$ " + precoVenda.toLocaleString('pt-br', { minimumFractionDigits: 2 }));
                    $("#total_lucro").html("R$ " + precoLucro.toLocaleString('pt-br', { minimumFractionDigits: 2 }));
                })
            }
        }).catch(function(err){
            console.log(err);
        })
}

function verVenda(idVenda) {
    $("#modal_venda").find('input').val("");
    $("#nome").html("");
    $("#produto_nome").html("");
    firebase.firestore().collection("vendas").doc(idVenda).get().then(function (venda) {
        firebase.firestore().collection("login").doc(venda.data().comprador).get().then(function(comprador){
            window.idVendaAtual = idVenda;
            if(venda.data().status){
                $("#venda_situacao").val(venda.data().status);
            }
            if(venda.data().pagamento_confirmado){
                $("#btn-salvar-venda").hide();
                $("#nome").prop('disabled', true);
                $("#venda_situacao").prop('disabled', true);
            }else{
                $("#btn-salvar-venda").show();
                $("#nome").prop('disabled', false);
                $("#venda_situacao").prop('disabled', false);
            }
            var nome = comprador.data().nome;
            $("#nome").append(`<option value="${nome}">${nome}</option>`);
            $("#cpf").val(venda.data().destinatario.cpf);
            $("#celular").val(comprador.data().celular);
            $("#email").val(venda.data().destinatario.email);
            $("#cep").val(venda.data().destinatario.cep);
            $("#logradouro").val(venda.data().destinatario.logradouro);
            $("#numero").val(venda.data().destinatario.numero);
            $("#complemento").val(venda.data().destinatario.complemento);
            $("#bairro").val(venda.data().destinatario.bairro);
            $("#cidade").val(venda.data().destinatario.cidade);
            $("#estado").val(venda.data().destinatario.estado);
            $("#itens-venda").html("")
            var produtos = venda.data().itens;
            var valorTotalVenda = 0;
            var valorTotalLiquido = 0;
            for(let i = 0; i < produtos.length; i++){
                $("#itens-venda").append(`
                    <tr>
                        <td>${i + 1}</td>
                        <td>${produtos[i].qtd}</td>
                        <td>${produtos[i].dados.nome}</td>
                        <td>${(produtos[i].dados.preco_venda * produtos[i].qtd).toLocaleString('pt-br', { minimumFractionDigits: 2 })}</td>
                        <td>${(produtos[i].dados.preco_compra * produtos[i].qtd).toLocaleString('pt-br', { minimumFractionDigits: 2 })}</td>
                    </tr>
                `)
                var valorVenda = produtos[i].dados.preco_venda * produtos[i].qtd;
                valorTotalVenda += valorVenda;
                valorTotalLiquido += valorVenda - (produtos[i].dados.preco_compra * produtos[i].qtd);
            }
            $("#valor-total-venda").html(`<b>Valor total bruto: </b>R$ ${valorTotalVenda.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`);
            $("#valor-total-liquido").html(`<b>Valor total líquido: </b>R$ ${valorTotalLiquido.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`);
            $("#modal_venda").find('input').prop('disabled', true);
        })
    })
    $("#modal_venda").modal('show');
}

function salvarVenda() {
    if(window.idVendaAtual){
            var venda = {}
            venda.status = $("#venda_situacao").val();
            venda.ultima_alteracao = new Date();
            firebase.firestore().collection("vendas").doc(window.idVendaAtual).set(venda, {merge: true}).then(function(){
                vendaGravadaComSucesso();
            })
    }
}

function vendaGravadaComSucesso(){
    new Swal({
        title: "Sucesso!",
        icon: "success",
        text: "Venda Salva Com sucesso!"
    }).then(function () {
      location.reload();
    })
}