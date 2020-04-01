<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="box-card">
            <el-alert
                    title="注意:只允许为第三级分类设置相关参数!"
                    type="warning" :closable="false" show-icon>
            </el-alert>
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader size="medium"
                                 v-model="selectKeys"
                                 :options="parentCateList"
                                 :props="cascaderProps"
                                 @change="parentCateChange" clearable></el-cascader>
                </el-col>
            </el-row>
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
                <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
                <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
                <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "Params",
        data(){
            return{
                parentCateList: [],
                cascaderProps: {
                    value: "cat_id",
                    label: "cat_name",
                    children: "children",
                    expandTrigger: "hover",
                    checkStrictly: false
                },
                selectKeys:[],
                activeName:'first'
            }
        },
        created(){
            this.getParentCateList()
        },
        methods:{
            async getParentCateList() {
                const { data: res } = await this.$http.get("categories", { params: { type: 3 } })
                if (res.meta.status !== 200) {
                    return this.$message.error("获取父级分类失败!")
                }
                console.log(res)
                this.parentCateList = res.data
            },
            parentCateChange() {
                if (this.selectKeys.length !==3) {
                    this.selectKeys = []
                    return
                }
            },
            handleClick(){
                console.log(this.activeName)
            }
        }
    }
</script>

<style scoped>
.cat_opt{
    margin: 15px 5px;
}
</style>
