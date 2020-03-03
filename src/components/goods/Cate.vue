<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片表格区-->
        <el-card class="box-card">
            <el-row :gutter="20">
                <el-col :span="4">
                    <el-button type="primary" @click="showAddDialog()">添加用户</el-button>
                </el-col>
            </el-row>
            <tree-table class="treeTable" :data="CateList" :columns="columns" :selection-type="false"
                        :expand-type="false"
                        :show-index="true" index-text="#" border :show-row-hover="false">
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
                    <el-tag v-else type="warning" size="mini">三级</el-tag>
                </template>
                <template slot-scope="scope" slot="opt">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"
                               circle></el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" circle
                               @click="deleteConfirm(scope.row)"></el-button>
                </template>
            </tree-table>
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[5, 10, 15, 20]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <el-dialog
                title="添加分类"
                :visible.sync="addDialogVisible"
                width="30%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类" prop="password">
                    <div class="block">
                        <el-cascader
                                v-model="selectKeys"
                                :options="parentCateList"
                                :props="cascaderProps"
                                @change="parentCateChange" clearable></el-cascader>
                    </div>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
        </el-dialog>
        <el-dialog
                title="修改分类"
                :visible.sync="updateDialogVisible"
                width="50%" @close="updateDialogClosed">
            <el-form :model="updateForm" :rules="updateFormRules" ref="updateFormRef" label-width="80px">
                <el-form-item label="分类名称">
                    <el-input v-model="updateForm.cat_name" disabled></el-input>
                </el-form-item>
                <el-form-item label="父级分类" prop="email">

                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="updateUser">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Cate",
        data() {
            var checkEmail = (rule, value, callback) => {
                const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
                if (regEmail.test(value)) {
                    return callback()
                }
                callback(new Error("请输入合法的邮箱"))
            }
            var checkMobile = (rule, value, callback) => {
                const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
                if (regMobile.test(value)) {
                    return callback()
                }
                callback(new Error("请输入合法的号码"))
            }
            return {
                //获取用户列表的参数
                queryInfo: {
                    type: 1,
                    pagenum: 1,
                    pagesize: 5
                },
                CateList: [],
                columns: [{
                    label: '分类名称',
                    prop: 'cat_name',
                }, {
                    label: '是否有效',
                    type: 'template',
                    template: 'isok'
                }, {
                    label: '排序',
                    type: 'template',
                    template: 'order'
                }, {
                    label: '操作',
                    type: 'template',
                    template: 'opt'
                }],
                total: 0,
                addDialogVisible: false,//控制新增对话框可见
                updateDialogVisible: false,//控制修改对话框可见
                //添加用户的表单数据
                addForm: {
                    cat_name: "",
                    cat_level: 0,
                    cat_pid: 0
                },
                //添加表单的验证规则
                addFormRules: {
                    cat_name: [
                        {required: true, message: "请输入用户名", trigger: "blur"},
                    ],
                },
                updateForm: {},
                updateFormRules: {
                    cat_name: [
                        {required: true, message: "请输入邮箱", trigger: "blur"}
                    ]
                },
                roleDialogVisible: false,
                userInfo: {},
                rolesList: [],
                selectedRoleId: '',
                parentCateList: [],
                cascaderProps: {
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children',
                    expandTrigger: 'hover',
                    checkStrictly: true
                },
                selectKeys: []
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            async getCateList() {
                const {data: res} = await this.$http.get("categories", {params: this.queryInfo})
                if (res.meta.status !== 200) {
                    return this.$message.error("获取用户列表失败!")
                }
                this.CateList = res.data.result
                this.total = res.data.total
            },
            //监听pagesize变化的事件
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getCateList()
            },
            //监听页码值改变的事件
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getCateList()
            },
            //监听switch用户状态
            async userStateChange(userinfo) {
                const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
                if (res.meta.status !== 200) {
                    userinfo.mg_state = !userinfo.mg_state
                    return this.$message.error("更新用户状态失败!")
                }
                this.$message.success("更新用户成功!")
            },
            //close对话框之后清空事件
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            //添加用户
            addUser() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return
                    const {data: res} = await this.$http.post("users", this.addForm)
                    if (res.meta.status !== 201) {
                        this.$message.error("添加用户失败!")
                    } else {
                        this.$message.success("添加用户成功!")
                        this.addDialogVisible = false
                        this.getCateList()
                    }
                })
            },
            //修改
            async showEditDialog(userinfo) {
                this.updateDialogVisible = true
                const {data: res} = await this.$http.get(`users/${userinfo.id}`)
                if (res.meta.status === 200) {
                    this.updateForm = res.data
                }
            },
            //close对话框之后清空事件
            updateDialogClosed() {
                this.$refs.updateFormRef.resetFields()
            },
            updateUser() {
                this.$refs.updateFormRef.validate(async valid => {
                    if (!valid) return
                    const {data: res} = await this.$http.put(`users/${this.updateForm.id}`, this.updateForm)
                    if (res.meta.status !== 200) {
                        this.$message.error("修改用户失败!")
                    }
                    this.$message.success("修改用户成功!")
                    this.updateDialogVisible = false
                    this.getCateList()
                })
            },
            deleteConfirm(userinfo) {
                {
                    this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(async () => {
                        const {data: res} = await this.$http.delete(`users/${userinfo.id}`)
                        if (res.meta.status === 200) {
                            this.getCateList()
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                        } else {
                            this.$message({
                                type: 'error',
                                message: '删除失败!'
                            });
                        }
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消删除'
                        });
                    });
                }
            },
            async setRole(userInfo) {
                this.userInfo = userInfo
                const {data: res} = await this.$http.get('roles')
                if (res.meta.status !== 200) {
                    return this.$message.error('获取权限列表失败!')
                }
                this.rolesList = res.data
                this.roleDialogVisible = true
            },
            async saveRoleInfo() {
                if (!this.selectedRoleId) {
                    return this.$message.error('请选择角色!')
                }
                const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedRoleId})
                if (res.meta.status !== 200) {
                    return this.$message.error('修改用户角色失败!')
                }
                this.$message.success('修改用户角色成功!')
                this.getCateList()
                this.roleDialogVisible = false
            },
            setRoleDialogClosed() {
                this.selectedRoleId = ''
                this.userInfo = {}
            },
            showAddDialog() {
                this.getParentCateList()
                this.addDialogVisible = true
            },
            async getParentCateList() {
                const {data: res} = await this.$http.get('categories', {params: {type: 2}})
                if (res.meta.status !== 200) {
                    return this.$message.error('获取父级分类失败!')
                }
                console.log(res)
                this.parentCateList = res.data
            },
            parentCateChange() {

            }
        }

    }
</script>

<style scoped lang="less">
    .treeTable {
        margin-top: 15px;
    }

    .el-cascader {
        width: 100%;
    }
</style>
