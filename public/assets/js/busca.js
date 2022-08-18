var urlString = window.location.href;
var url = new URL(urlString);
var buscarPor = url.searchParams.get("por");
var paginaAtual = url.searchParams.get("pagina");
if(paginaAtual == null){
    paginaAtual = 1;
}else{
    paginaAtual = parseInt(paginaAtual);
}

if(buscarPor == "PROMOCAO"){
    $(".nav-item").removeClass("active");
    $("#promocao").addClass("active");
}

function addProdutoNaTabela(produto, filtros) {
    if (produto.data().foto_destaque != null && produto.data().foto_destaque != "") {
        var foto = produto.data().foto_destaque;
    } else {
        var foto = "../assets/images/no-image.png";
    }
    var palavraChave = (produto.data().nome + produto.data().autor_fabricante).toUpperCase().trim()
                                                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    var precoOriginal = produto.data().preco_venda;
    if(produto.data().desconto && produto.data().desconto > 0){
        var precoDesconto = ((precoOriginal / 100) * produto.data().desconto);
        var precoComDesconto = precoOriginal - precoDesconto;
        var preco = `<span style="font-size: 20px;">
                        R$ ${precoComDesconto.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
                    </span>
                    <span style="text-decoration: line-through; color:red; font-size: 12px">
                        R$ ${precoOriginal.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
                    </span>
                    `
        var promocao = "PROMOCAO";
    }else{
        preco = "R$ " + precoOriginal.toLocaleString('pt-br', { minimumFractionDigits: 2 });
        var promocao = "";
    }
    let html = `<div id="${produto.id}" pesquisar-por="${palavraChave}${promocao}" class="item ${filtros} col-md-4" style="display: none;">
                    <a href="produto.html?cod=${produto.id}">
                    <div class="featured-item text-center">
                        <img src="${foto}" class="mx-auto text-center" style="max-height: 220px; height 220px; width: auto;" >
                        <h4>${produto.data().nome}</h4>
                        <h6 style="font-size: 20px">${preco}</h6>
                    </div>
                    </a>
                </div>`
    $("#todos_produtos").append(html);
}

function buscarProdutos() {
    firebase.firestore().collection("produtos").where("deletado", "==", false)
        .orderBy("ultima_alteracao", "desc").get().then(function (resultado) {
            var maiorValor= 0;
            var produtosRecentes = [];
            $.each(resultado.docs, function(i, prod){
                if(prod.data().preco_venda > maiorValor){
                    maiorValor = prod.data().preco_venda;
                }
                if(i < 6){
                    produtosRecentes.push(prod.id);
                }
            })
            var pontoDeCorte = maiorValor / 2;

            for (let produto of resultado.docs) {
                var filtros = "";
                if(produto.data().preco_venda > pontoDeCorte){
                    filtros += " alto "; 
                }else{
                    filtros += " baixo ";
                }
                if(produtosRecentes.includes(produto.id)){
                    filtros += " recentes ";
                }
                addProdutoNaTabela(produto, filtros);
            }
            paginarResultados();
            iniciarFiltragem();
        }).catch(function (error) {
            console.log(error);
        })
}

function pesquisarProduto(){
    var pesquisaCript = encodeURI($('#campo_pesquisa').val());
    window.location.href = "./busca.html?por=" + pesquisaCript;
}

//função pra possibilitar pesquisar com enter
document.querySelector('#campo_pesquisa').addEventListener('keypress', function (tecla) {
    if (tecla.key == 'Enter') {
        tecla.preventDefault();
        pesquisarProduto();
    }
});

function paginarResultados(){
    if(buscarPor){
        buscarPor = buscarPor.toUpperCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        
        adicionarPaginas(`[pesquisar-por*="${buscarPor}"]`);
        //$(`[pesquisar-por*="${buscarPor}"]`).fadeIn();
    }else{
       adicionarPaginas(".item");
    }
}

function mudarDePagina(pagina){
    if(buscarPor){
        url.searchParams.delete("pagina");
        location.href = url.toString() + '&pagina=' + pagina;
    }else{
        window.location.href = './busca.html?pagina=' + pagina;
    }
}

function adicionarPaginas(seletor){
    var qtdPaginas;
    var qtdProdutos = $(seletor).length;
    $("#btn_paginas").html("");
    qtdPaginas = Math.round(qtdProdutos / 6);
    for(i = 1; i<=qtdPaginas; i++){
        $("#btn_paginas").append(
            `<li id="pagina_${i}"><a href="#" onclick="mudarDePagina(${i})">${i}</a></li>`
        )
    }
    $("#pagina_"+paginaAtual).addClass("current-page");
    $(seletor).each(function(i, produto){
        var indiceProduto = i + 1;
        var indiceInicial = (paginaAtual * 6) - 6;
        var indiceFinal = paginaAtual * 6;
        if(indiceProduto > indiceInicial && indiceProduto <= indiceFinal){
            $(produto).fadeIn();
        }
    })
    if(qtdPaginas == 1){
        $('#btn_paginas').html("");
        if(!buscarPor){
            $(seletor).fadeIn();
        }
    } 
}

function iniciarFiltragem() {
    // filter items on button click
    $('#filters').on('click', 'button', function () {
        buscarPor = null;
        $(".item").fadeOut();
        var filterValue = $(this).attr('data-filter');
        setTimeout(function(){
            adicionarPaginas(filterValue);
        }, 300)
    });
}

$(document).ready(function () {
    buscarProdutos();
})

