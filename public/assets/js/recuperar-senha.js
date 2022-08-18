function recuperarSenha(){
    var email = $("#navbarDropdownMenuLink").html();
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
       new Swal('Sucesso!', 'Um link para alterar sua senha foi enviado para o e-mail ' + email, "success")
    })
    .catch((error) => {
        console.log(error);
        new Swal('Erro!', 'Erro ao enviar link de redefinição de senha para o e-mail '+ email, "error");
    });
}