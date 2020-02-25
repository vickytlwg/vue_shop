<template>
    <el-container class="home-container">
        <el-header>
            <div class="header-left">
                <img src="../assets/heima.png" alt="">
                <span>后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <el-aside :width="isCollapse?'64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <el-menu :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" :router="true"
                         background-color="#545c64"
                         text-color="#fff"
                         active-text-color="#409eff" :default-active="activePath">
                    <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
                        <!--一级菜单的模版区域-->
                        <template slot="title">
                            <i :class="iconsObj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
                            <!--二级菜单的模版区域-->
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-container>
                <el-main>
                    <!--路由占位符-->
                    <router-view>

                    </router-view>
                </el-main>
            </el-container>
        </el-container>
    </el-container>
</template>

<script>
  export default {
    name: "Home",
    data() {
      return {
        //左侧菜单数据
        menuList: [],
        iconsObj: {
          "125": "iconfont icon-user",
          "103": "iconfont icon-tijikongjian",
          "101": "iconfont icon-shangpin",
          "102": "iconfont icon-danju",
          "145": "iconfont icon-baobiao"
        },
        isCollapse: false,
        activePath:'',
      }
    },
    created() {
      this.getMenuList()
      this.activePath=window.sessionStorage.getItem('activePath')
    },
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push("/login")
      },
      //获取所有的菜单
      async getMenuList() {
        const { data: res } = await this.$http.get("menus")
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menuList = res.data
      },
      //点击折叠
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      //保存当前高亮链接
      saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath=activePath
      }
    }
  }
</script>

<style lang="less" scoped>
    .el-header {
        background-color: #373d41;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 0;
        color: #fff;
        font-size: 20px;

        > div {
            display: flex;
            align-items: center;

            span {
                margin-left: 15px;
            }
        }
    }

    .el-aside {
        background-color: #333744;

        .el-menu {
            border-right: none;
        }
    }

    .el-main {
        background-color: #eaedf1;
    }

    .home-container {
        height: 100%;
    }

    .iconfont {
        margin-right: 10px;
    }

    .toggle-button {
        letter-spacing: 0.2em;
        text-align: center;
        background-color: #4a5064;
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        cursor: pointer;
    }
</style>
