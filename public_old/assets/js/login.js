function validarLogin(){
    $('#load').show();
    var email = $('#email').val(); 
    var senha = $('#senha').val();

    if(email == ""){
        $('#load').hide();
        Swal.fire({icon: 'error', title: 'Insira um E-mail!' });
        return;
    }
    if(senha == ""){
        $('#load').hide();
        Swal.fire({icon: 'error', title: 'Insira uma Senha!'});
        return;
    }
    firebase.auth().signInWithEmailAndPassword(email, senha).then((userCredential) => {
        var user = userCredential.user;
    }).catch((error) => {
            $('#load').hide();
            var errorCode = error.code;
            var errorMessage = error.message;
            if(errorCode == 'auth/wrong-password'){
                new Swal("Ops, Algo deu errado!", "A senha inserida está inválida. Tente novamente!", "error");
            }else if(errorCode == 'auth/invalid-email'){
                new Swal("Ops, Algo deu errado!", "O E-mail inserido está inválido. Tente novamente!", "error");
            }else if(errorCode == 'auth/user-not-found'){
                new Swal("Ops, Algo deu errado!", "Usuário não encontrado. Tente novamente!", "error");
            }else{
                new Swal("Ops, Algo deu errado!", "Não foi possível conectar. Tente novamente, se o erro persistir entre em contato com o administrador", "error");
            }
    });
}

$(document).ready(function(){
    firebase.auth().onAuthStateChanged(function(usuarioLogado){
        if(usuarioLogado){
            location.href = "./inicio.html";
        }else{
            $('#load').hide();
        }
    })
});