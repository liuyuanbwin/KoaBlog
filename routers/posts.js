const router = require('koa-router')();
const userModel = require('../lib/mysql.js')
const moment = require('moment')
const checkNotLogin = require('../middlewares/check.js').checkNotLogin
const checkLogin = require('../middlewares/check.js').checkLogin
const md = require('markdown-it')()

//重置到文章页
router.get('/',async(ctx,next)=>{
    ctx.redirect('/posts')
})

//文章页
router.get('/posts', async(ctx, next) =>{
    let res,
        postsLength,
        name = decodeURIComponent(ctx.request.querystring.split('=')[1]);
    if (ctx.request.querystring){
        await userModel.findDataByUser(name)
            .then(result => {
                postsLength = result.lenght
            })
        await userModel.findPostByUserPage(name, 1)
            .then(result => {
                res = result
            })
        await ctx.render('selfPosts',{
            session:ctx.session,
            posts:res,
            postsPageLength:Math.ceil(postsLength / 10),
        })
    }else{
        await userModel.findPostByPage(1)
            .then(result => {
                res = result
            })
        await userModel.findAllPost()
            .then(result => {
                postsLength = result.length
            })
        await ctx.render('posts', {
            session:ctx.session,
            posts:res,
            postsLength:postsLength,
            postsPageLength:Math.ceil(postsLength / 10),
        })
    }
})
