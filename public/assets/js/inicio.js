window.produtoId = null;

function novoProduto(){
    $("#modal_produto").find("input").val("");
    $("#modal_produto").find("textarea").val("");
    $(".btn_apaga_foto").parent().find('img').attr('src', '../assets/images/no-image.png');
    $(".btn_apaga_foto").parent().find('input').val('');
    $('#modal_produto').modal('show');
    window.produtoId = null;
}

function buscarProdutos(){
    firebase.firestore().collection('produtos').where("deletado", "==", false).get().then(function(produtos){
        for(let produto of produtos.docs){
            addProdutosNaTabela(produto);
        }
        $("#tabela_produtos").DataTable({
            "language": {
                "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Portuguese-Brasil.json"
            }
        });
    })
}

function addProdutosNaTabela(prod){
    $('#lista_produtos').append(`
        <tr>
            <td>${prod.id}</td>
            <td>${prod.data().nome}</td>
            <td>${prod.data().preco_venda.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td>${prod.data().preco_compra.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td><a class="icone_editar"><i class="fas fa-edit pr-2" onclick="editarProduto('${prod.id}')"></i>
                </a> <a class="icone_excluir"><i class="fas fa-trash" onclick="excluirProduto('${prod.id}')"></i></a></td>
        </tr>
    `);
}

function editarProduto(idProduto){
    window.produtoId = idProduto;
    firebase.firestore().collection("produtos").doc(idProduto).get().then(function(produto){
        if(produto.data().categorias != null){
            var categ = produto.data().categorias.join(";");
        }else{
            var categ = "";
        }

        $('.carregar_foto').attr('src', '../assets/images/no-image.png');

        if(produto.data().foto_destaque){
            $("#produto_foto_destaque").parent().find("img").attr('src', produto.data().foto_destaque)
        }
        if(produto.data().foto_1){
            $("#produto_foto_1").parent().find("img").attr('src', produto.data().foto_1)
        }
        if(produto.data().foto_2){
            $("#produto_foto_2").parent().find("img").attr('src', produto.data().foto_2)
        }
        if(produto.data().foto_3){
            $("#produto_foto_3").parent().find("img").attr('src', produto.data().foto_3)
        }
        if(produto.data().foto_4){
            $("#produto_foto_4").parent().find("img").attr('src', produto.data().foto_4)
        }
        if(produto.data().foto_5){
            $("#produto_foto_5").parent().find("img").attr('src', produto.data().foto_5)
        }
        $('#produto_nome').val(produto.data().nome);
        $('#produto_autor_fabricante').val(produto.data().autor_fabricante);
        $('#produto_descricao').val(produto.data().descricao);
        $('#produto_categorias').val(categ);
        $('#produto_url').val(produto.data().url_pagamento);
        $('#produto_preco_venda').val(produto.data().preco_venda.toLocaleString('pt-BR', {minimumFractionDigits: 2}));
        $('#produto_preco_compra').val(produto.data().preco_compra.toLocaleString('pt-BR', {minimumFractionDigits: 2}));
        $('#produto_desconto').val(produto.data().desconto);
        $('#produto_qtd_estoque').val(produto.data().qtd_estoque);
        $('#modal_produto').modal("show");
    })
}

function salvarProduto(){
    var objProduto = { 
        nome: $('#produto_nome').val(),
        autor_fabricante: $('#produto_autor_fabricante').val(),
        descricao: $('#produto_descricao').val(),
        categorias: $('#produto_categorias').val().split(";"),
        url_pagamento: $("#produto_url").val(),
        preco_venda: parseFloat($('#produto_preco_venda').val().replace(/\./g, "").replace(",", ".")),
        preco_compra: parseFloat($('#produto_preco_compra').val().replace(/\./g, "").replace(",", ".")),
        desconto: parseFloat($('#produto_desconto').val()),
        qtd_estoque: parseInt($('#produto_qtd_estoque').val()),
        deletado: false,
        ultima_alteracao: new Date()
    }
    if($("#produto_nome").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Nome Produto" para continuar!', 'error');
        return;
    }
    if($("#produto_autor_fabricante").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Autor/Fabricante" para continuar!', 'error');
        return;
    }
    if($("#produto_descricao").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Descrição" para continuar!', 'error');
        return;
    }
    if($("#produto_categorias").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Categorias" para continuar!', 'error');
        return;
    }
    if($("#produto_url").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Url Produto" para continuar!', 'error');
        return;
    }
    if($("#produto_preco_venda").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Preço Venda" para continuar!', 'error');
        return;
    }
    if($("#produto_qtd_estoque").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Qtd. Estoque" para continuar!', 'error');
        return;
    }
    if($("#produto_foto_destaque").val() == "" && window.produtoId == null){
        new Swal("Atenção", 'Por favor preencha o campo "Foto/Banner de destaque" para continuar!', 'error');
        return;
    }
    var listaFotos = [];
    $('[type="file"]').each(function(){
        if($(this).val() != ""){
            listaFotos.push($(this).attr('id'));
        }else{
            if($(this).parent().find('img').attr('src') == '../assets/images/remover_foto.png'){
                var caminhoFoto = $(this).attr('id').replace("produto_", "");
                objProduto[caminhoFoto] = null;
            }
        }
    })
    if(listaFotos.length > 0){
        gravaFotoRecursiva(objProduto, listaFotos, 0);
    }else{
        gravarProduto(objProduto);
    }
}

function removerFoto(elemento){
    $(elemento).parent().find('img').attr('src', '../assets/images/remover_foto.png');
    $(elemento).parent().find('input').val('');
}

function gravaFotoRecursiva(objProduto, listaFotos, indiceFoto){
    $('#load').show();
    $('#modal_produto').modal("hide");
    var minhaFoto = document.getElementById(listaFotos[indiceFoto]).files[0];
    var horaAtual = new Date().getTime();
    var nomeFoto = horaAtual + minhaFoto.name;

    var servicoStorage = firebase.storage().ref().child("fotos_produtos/" + nomeFoto).put(minhaFoto);
        servicoStorage.on('state_changed',
        function(estadoEnvio){
            //todo Tratar a % do envio aqui
        },
        function(error){
            $('#load').hide();
            console.log(error);
            new Swal("Ops Algo deu errado!", "Ocorreu um erro ao salvar a foto", "error");
        },
        function(resultado){
            servicoStorage.snapshot.ref.getDownloadURL().then(function(urlFoto){
                var caminhoFoto = listaFotos[indiceFoto].replace("produto_", "");
                objProduto[caminhoFoto] = urlFoto;
                
                if(indiceFoto < (listaFotos.length - 1)){
                    gravaFotoRecursiva(objProduto, listaFotos, (indiceFoto + 1));
                }else{
                    gravarProduto(objProduto);
                }
            })
        }
    )
}


function gravarProduto(objProduto){
    $('#load').hide();
    if(window.produtoId != null){
        objProduto.ultima_alteracao = new Date();
        firebase.firestore().collection("produtos").doc(window.produtoId).set(objProduto, {merge: true}).then(function(){
            Swal.fire({
                title: 'Produto Editado com Sucesso!',
                icon: 'success',
                confirmButtonColor: '#ff6d12'
              }).then(() => {
                location.reload();
            })
        })
    }else{
        objProduto.cadastrado_em = new Date();
        firebase.firestore().collection("produtos").add(objProduto).then(function(resultado){
            Swal.fire({
                title: 'Produto Cadastrado com Sucesso!',
                text: 'Id do produto: '+ resultado.id,
                icon: 'success',
                confirmButtonColor: '#ff6d12'
              }).then(() => {
                location.reload();
            })
        })
    }
}

function excluirProduto(idProduto){
    objProduto = {deletado: true}
    Swal.fire({
        title: 'Tem certeza que deseja excluir este produto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, deletar!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
            firebase.firestore().collection('produtos').doc(idProduto).set(objProduto, {merge: true}).then(function(){
                Swal.fire({
                    title: 'Deletado com sucesso!',
                    icon: 'success',
                    confirmButtonColor: '#ff6d12'
                  }).then(()=>{
                        location.reload();
                  })
            })
            
        }
      })
}

$(".mascara_dinheiro").mask('000.000.000.000.000,00', {reverse: true});

$(document).ready(function(){
    firebase.auth().onAuthStateChanged(function(usuarioLogado){
        if(usuarioLogado){
            buscarProdutos(); 
            $('#navbarDropdownMenuLink').html(usuarioLogado.email);
            $('#load').hide();
        }else{
            location.href = "./index.html";
        }
    })
    $('[type="file"]').on('change', function(){
        if($(this).val() != ""){
            var idImagem = $(this).attr('id');
            var leitorDeArquivo = new FileReader();
            var imagem = document.getElementById(idImagem).files[0];
            leitorDeArquivo.onloadend = function(){
                $("#" + idImagem).parent().find("img").attr('src', leitorDeArquivo.result);
            }
            leitorDeArquivo.readAsDataURL(imagem);
        }
    })
});

