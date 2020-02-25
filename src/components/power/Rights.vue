<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>权限列表</span>
            </div>
            <el-table border stripe
                      :data="rightsList"
                      style="width: 100%">
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column
                        prop="authName"
                        label="姓名">
                </el-table-column>
                <el-table-column
                        prop="path"
                        label="路径">
                </el-table-column>
                <el-table-column
                        prop="level"
                        label="权限等级">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level==='0'">一级</el-tag>
                        <el-tag v-else-if="scope.row.level==='1'" type="success">二级</el-tag>
                        <el-tag v-else="scope.row.level==='2'" type="warning">三级</el-tag>
                    </template>
                </el-table-column>

            </el-table>

        </el-card>
    </div>
</template>

<script>
    export default {
        name: "Rights",
        data() {
            return {
                rightsList: []
            }
        },
        created() {
            this.getRightList()
        },
        methods: {
            async getRightList() {
                const {data: res} = await this.$http.get("rights/list")
                console.log(res)
                if (res.meta.status === 200) {
                    this.rightsList = res.data
                } else {
                    this.$message.error("获取权限列表失败!")
                }
            }
        }
    }
</script>

<style scoped>

</style>
