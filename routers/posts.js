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

//首页分页,每次输出10条
router.post('/posts/page', async(ctx, next) => {
    let page = ctx.request.body.page;
    await userModel.findPostByPage(page)
            .then(result=>{
                ctx.body = result
            }).catch(()=>{
                ctx.body = 'error'
            })
})

//个人文章分页,每次输出10条
router.post('/post/self/page', async(ctx, next) => {
    let data = ctx.request.body
    await userModel.findPostByUserPage(data.name,data.page)
            .then(result=>{
                ctx.body = result
            }).catch(()=>{
                ctx.body = 'error'
            })
})

//发表文章页面
router.get('/create', async(ctx, next) => {
    await ctx.render('create', {
        session:ctx.session,
    })
})

//post 发表文章
router.post('/create', async(ctx, next) => {
    let title = ctx.request.body.title,
        content = ctx.request.body.content,
        id = ctx.session.id,
        name = ctx.session.user,
        time = moment().format('YYYY-MM-DD HH:mm:ss'),
        avator,
        //仙子使用markdown 不需要单独转义
        newContent = content.replace(/[<">']/g, (target) => {
            return {
                '<':'&lt;',
                '"':'&quot;',
                '>':'&gt;',
                "'":'&#39;'
            }[target]
        }),
        newTitle = title.replace(/[<">']/g,(target) => {
            return {
                '<':'&lt;',
                '"':'&quot;',
                '>':'&gt;',
                "'":'&#39;'
            }[target]
        });

        await userModel.findUserData(ctx.session.user)
            .then(res => {
                console.log(res[0]['avator'])
                avator = res[0]['avator']
            })
        await userModel.insertPost([name, newTitle, md.render(content),content,id,time,avator]
            .then(() => {
                ctx.body = true
            }).catch(() => {
                ctx.body = false
            }))
})

module.exports = router
