$(document).ready(function () {
    $("#celular").mask('(99) 99999-9999');
    $("#cep").mask('99999-999');
    $("#cpf").mask('999.999.999-99');
    $("#qtd-carrinho").mask('99999');

    var url_String = window.location.href;
    var url = new URL(url_String);
    var idProduto = url.searchParams.get("cod");
    if (idProduto != null) {
        firebase.firestore().collection("produtos").doc(idProduto).get()
            .then(function (resultado) {
                if (resultado.exists) {
                    if (resultado.data().foto_destaque) {
                        $("#slider").find("ul").append(`<li><img src="${resultado.data().foto_destaque}"></li>`);
                        $("#carousel").find("ul").append(`<li><img src="${resultado.data().foto_destaque}"></li>`);
                    }
                    if (resultado.data().foto_1) {
                        $("#slider").find("ul").append(`<li><img src="${resultado.data().foto_1}"></li>`);
                        $("#carousel").find("ul").append(`<li><img src="${resultado.data().foto_1}"></li>`);
                    }
                    if (resultado.data().foto_2) {
                        $("#slider").find("ul").append(`<li><img src="${resultado.data().foto_2}"></li>`);
                        $("#carousel").find("ul").append(`<li><img src="${resultado.data().foto_2}"></li>`);
                    }
                    if (resultado.data().foto_3) {
                        $("#slider").find("ul").append(`<li><img src="${resultado.data().foto_3}"></li>`);
                        $("#carousel").find("ul").append(`<li><img src="${resultado.data().foto_3}"></li>`);
                    }
                    if (resultado.data().foto_4) {
                        $("#slider").find("ul").append(`<li><img src="${resultado.data().foto_4}"></li>`);
                        $("#carousel").find("ul").append(`<li><img src="${resultado.data().foto_4}"></li>`);
                    }
                    if (resultado.data().foto_5) {
                        $("#slider").find("ul").append(`<li><img src="${resultado.data().foto_5}"></li>`);
                        $("#carousel").find("ul").append(`<li><img src="${resultado.data().foto_5}"></li>`);
                    }
                    carregarSliderCarousel();

                    var precoOriginal = resultado.data().preco_venda;
                    if (resultado.data().desconto && resultado.data().desconto > 0) {
                        var precoDesconto = ((precoOriginal / 100) * resultado.data().desconto);
                        var precoComDesconto = precoOriginal - precoDesconto;
                        var preco = `<span style="font-size: 20px;">
                        R$ ${precoComDesconto.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
                    </span>
                    <span style="text-decoration: line-through; color:red; font-size: 12px">
                        R$ ${precoOriginal.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
                    </span>
                    `
                    } else {
                        preco = "R$ " + precoOriginal.toLocaleString('pt-br', { minimumFractionDigits: 2 });
                    }

                    $("#nome_produto").html(resultado.data().nome);
                    $("#autor_fabricante").html(resultado.data().autor_fabricante);
                    $("#preco_produto").html(preco);
                    $("#descricao").html(resultado.data().descricao);
                    $("#qtd_estoque").html(resultado.data().qtd_estoque + " em estoque");
                    if (resultado.data().categorias) {
                        var categ = resultado.data().categorias.join(", ");
                    } else {
                        var categ = "";
                    }
                    $("#categorias_produto").append(categ);
                    window.produtoSelecionado = resultado;
                    //$("#url_produto").attr("href", resultado.data().url_pagamento);
                } else {
                    alert("Produto não encontrado");
                    location.href = "./";
                }
            })
    } else {
        location.href = "./";
    }
})

function adicionarNoCarrinho(){
    var carrinho = localStorage.getItem('carrinho');
    var produto = {
        id: window.produtoSelecionado.id,
        dados: window.produtoSelecionado.data(),
        qtd: parseInt($('#qtd-carrinho').val())
    }
    if(!carrinho){
        var carrinho = {
            itens: []
        }
    }else{
        carrinho = JSON.parse(carrinho);
    }
    carrinho.itens.push(produto);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    new Swal('Sucesso!', 'Produto(s) adicionado(s) ao carrinho com sucesso!', 'success')
    recuperaCarrinho();
}


