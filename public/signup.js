const alertBox= document.getElementById('alert')
const submitBtn=document.getElementById('submit-btn')
const form=document.getElementById('signupForm')


const showAlert=(message,type)=>{
    alertBox.textContent=message
    alertBox.className= `alert ${type}`
    alertBox.style.display='block'
}

//gogogoggogoggog

const showFieldError=(fieldId,errorId,show)=>{
    const field= document.getElementById(fieldId)
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
    const email=document.getElementById('email').value.trim()
    const password=document.getElementById('password').value
    const passwordConfirm=document.getElementById('passwordConfirm').value

let valid=true

if(!username){
    showFieldError('username','username-error',true)
    valid=false
}else{
    showFieldError('username','username-error',false)
}

const emailregex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/

if(!emailregex.test(email)){
    showFieldError('email','email-error',true)
    valid=false
}else{
    showFieldError('email','email-error',false)
}

if(password.length <5){
    showFieldError('password','passsword-error',true)
    valid=false
}else{
   showFieldError('password','passsword-error',false)
    
}
if(passwordConfirm !== password){
    showFieldError('passwordConfirm','passswordConfirm-error',true)
    valid=false
}else{
    showFieldError('passwordConfirm','passswordConfirm-error',false) 
}

return valid
}

form.addEventListener('submit',async (e)=>{

    e.preventDefault()

    alertBox.style.display='none'

    if(!validate())return

    const username=document.getElementById('username').value.trim()
    const email=document.getElementById('email').value.trim()
    const password=document.getElementById('password').value
    const passwordConfirm=document.getElementById('passwordConfirm').value
    const role=document.getElementById('role').value

         submitBtn.disabled=true
         submitBtn.textContent="creating account....."
    try{
        const res=  await fetch('api/v1/auth/signup',{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            credentials:'include',
            body:JSON.stringify({username,email,password,passwordConfirm,role})   
        })

        const data= await res.json()

        if(!res.ok){
            showAlert(data.message||'something went wrong','error')
            return
        }


        localStorage.setItem('accessToken',data.accessToken)

        localStorage.setItem('user',JSON.stringify(data.user))

        showAlert('succesful creating usser account','success')
        setTimeout(()=>{
            window.location.href='app.html'
        },1200)

    }catch(err){
             if(err){
                showAlert('something really went wrong','error')
             }
    }finally{

        submitBtn.disabled=false
        submitBtn.textContent="submit"
    }

})