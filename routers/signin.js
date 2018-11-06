const router = require('koa-router')();
const userModel = require('../lib/mysql.js')
const md5 = require('md5')
const checkNotLogin = require('../middlewares/check.js').checkNotLogin
const checkLogin = require('../middlewares/check.js').checkLogin

router.get('/signin', async(ctx, next)  => {

    await checkNotLogin(ctx)
    await userModel.queryStart()
        .then(result => {
            console.log('*****---->>>>' + JSON.stringify(result))
            
        }).catch(err => {
            console.log(err)
        })
    await ctx.render('signin',{
        session: ctx.session,
    })
})

router.post('/signin', async(ctx, next) => {
    let name = ctx.request.body.name;
    let pass = ctx.request.body.password;
    console.log('--------->>>>' + ctx.request.body.name)
    await userModel.findDataByName(name)
        .then(result => {
            console.log('####>>>>' + JSON.stringify(result))
            if(result !== null){
                    let res = result
                if (name === res[0]['name'] && md5(pass) === res[0]['pass']) {
                    ctx.body = true
                    ctx.session.user = res[0]['name']
                    ctx.session.id = res[0]['id']
                    console.log('ctx.session.id', ctx.session.id)
                    console.log('session', ctx.session)
                    console.log('登录成功')
                }else{
                    ctx.body = false
                    console.log('用户名或密码错误!')
                }
            }else{
                console.log('false --------->>>>' + result)
                ctx.body = false
            }
            
        }).catch(err => {
            console.log(err)
        })
})

module.exports = router 
