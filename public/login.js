const alertBox=document.getElementById('alert')
const form=document.getElementById('loginForm')
const submitBtn=document.getElementById('submit-btn')

const showAlert=(message,type)=>{
    alertBox.textContent=message
    alertBox.className=`alert ${type}`
    alertBox.style.display='block'
}

const showFieldError=(fieldId,errorId,show)=>{
    const field=document.getElementById(fieldId)
    const errorMsg=document.getElementById(errorId)

    if(show){
        field.classList.add('error')
        errorMsg.style.display='block'
    }else{
        field.classList.remove('error')
        errorMsg.style.display='none'
    }
}

const validate=()=>{
    const username=document.getElementById('username').value.trim()
    const passsword=document.getElementById('password').value
    let valid=true

if(!username){
    showFieldError('username','username-error',true)
    valid=false
}else{
    showFieldError('username','username-error',false)
}

if(!passsword){
    showFieldError('password','password-error',true)
    valid=false
}else{
    showFieldError('password','password-error',false)
}

return valid
}

const accessToken=localStorage.getItem('accessToken')
if(accessToken){
    window.location.href='app.html'
}

 form.addEventListener('submit',async(e)=>{

    e.preventDefault()
    alertBox.style.display='none'

    if(!validate())return
          submitBtn.disabled=true
           submitBtn.textContent='loggging in......'

    const username=document.getElementById('username').value.trim()
    const passsword=document.getElementById('password').value

try{
    const res= await fetch('api/v1/auth/login',{
        method:'POST',
        headers: {'Content-Type':'application/json'},
        credentials:'include',
        body:JSON.stringify({username,passsword})
    })

    const data= await res.json()

    if(!res.ok){
        showAlert(data.message||'incorrect username or password','error')
        return
    }
    
    localStorage.setItem('accessToken',data.accessToken)
    localStorage.setItem('user',JSON.stringify(data.user))

    window.location.href='app.html'

}catch(err){
         showAlert('could not log you in, try again','error')
}finally{
    submitBtn.disabled=false
    submitBtn.textContent='Log in'
}
 })

