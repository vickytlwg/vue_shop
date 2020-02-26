<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="box-card">
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
                </el-col>
            </el-row>
            <el-table border stripe
                      :data="roleList"
                      style="width: 100%">
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']"
                                v-for="(item1,i1) in scope.row.children"
                                :key="item1.id">
                            <el-col :span="5">
                                <el-tag type="primary" closable @close="removeRightById(scope.row,item1.id)">
                                    {{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children"
                                        :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">
                                            {{item2.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag v-for="(item3,i3) in item2.children" :key="item3.id" type="warning"
                                                closable @close="removeRightById(scope.row,item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column
                        prop="roleName"
                        label="姓名">
                </el-table-column>
                <el-table-column
                        prop="roleDesc"
                        label="角色描述">
                </el-table-column>
                <el-table-column width="180"
                                 label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"
                                   circle></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" circle
                                   @click="deleteConfirm(scope.row)"></el-button>
                        <el-tooltip class="item" effect="dark" content="分配权限" placement="top-end" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" circle
                                       @click="showSetRightDialog(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <el-dialog
                title="添加用户"
                :visible.sync="addDialogVisible"
                width="30%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRole()">确 定</el-button>
  </span>
        </el-dialog>
        <el-dialog
                title="修改用户"
                :visible.sync="updateDialogVisible"
                width="50%" @close="updateDialogClosed">
            <el-form :model="updateForm" :rules="addFormRules" ref="updateFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="updateForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="updateForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="updateRole">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog
                title="分配权限"
                :visible.sync="setRightDialogVisible"
                width="50%" @close="setRightDialogClosed">
            <el-tree :data="rightsList" :props="treeProps" node-key="id" show-checkbox default-expand-all
                     :default-checked-keys="defKeys"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Roles",
        data() {
            return {
                roleList: [],
                //添加用户的表单数据
                addForm: {
                    roleName: "",
                    roleDesc: "",
                },
                updateForm: {},
                addDialogVisible: false,
                updateDialogVisible: false,
                //添加表单的验证规则
                addFormRules: {
                    roleName: [
                        {required: true, message: "请输入角色名称", trigger: "blur"},
                    ]
                },
                setRightDialogVisible: false,
                rightsList: [],
                treeProps: {
                    label: 'authName',
                    children: 'children'
                },
                defKeys: []
            }
        },
        created() {
            this.getRoleList()
        },
        methods: {
            async getRoleList() {
                const {data: res} = await this.$http.get('roles')
                if (res.meta.status !== 200) {
                    return this.$message.error('获取角色列表失败!')
                }
                this.roleList = res.data
            },
            //close对话框之后清空事件
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            //添加用户
            addRole() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return
                    const {data: res} = await this.$http.post("roles", this.addForm)
                    if (res.meta.status !== 201) {
                        this.$message.error("添加用户失败!")
                    } else {
                        this.$message.success("添加用户成功!")
                        this.addDialogVisible = false
                        this.getRoleList()
                    }
                })
            },
            //修改
            async showEditDialog(roleinfo) {
                this.updateDialogVisible = true
                const {data: res} = await this.$http.get(`roles/${roleinfo.id}`)
                if (res.meta.status === 200) {
                    this.updateForm = res.data
                }
            },
            //close对话框之后清空事件
            updateDialogClosed() {
                this.$refs.updateFormRef.resetFields()
            },
            updateRole() {
                this.$refs.updateFormRef.validate(async valid => {
                    if (!valid) return
                    const {data: res} = await this.$http.put(`roles/${this.updateForm.roleId}`, this.updateForm)
                    if (res.meta.status !== 200) {
                        this.$message.error("修改用户失败!")
                    } else {
                        this.$message.success("修改用户成功!")
                        this.updateDialogVisible = false
                        this.getRoleList()
                    }
                })
            },
            deleteConfirm(roleinfo) {
                {
                    this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(async () => {
                        const {data: res} = await this.$http.delete(`roles/${roleinfo.id}`)
                        if (res.meta.status === 200) {
                            this.getRoleList()
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
            //根据id删除对应的权限
            async removeRightById(role, rightId) {
                const confrimResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                if (confrimResult !== 'confirm') {
                    return this.$message.info('取消了删除!')
                }
                const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                if (res.meta.status !== 200) {
                    return this.$message.error('删除失败!')
                }
                //this.$message.success('删除成功!')
                role.children = res.data
            },
            async showSetRightDialog(role) {
                const {data: res} = await this.$http.get('rights/tree')
                if (res.meta.status !== 200) {
                    return this.$message.error('获取权限失败!')
                }
                this.rightsList = res.data
                this.getLeafKeys(role,this.defKeys)
                this.setRightDialogVisible = true
            },
            setRightDialogClosed() {
                this.defKeys=[]
            },
            //通过递归的形式获取三级节点id
            getLeafKeys(node, arr) {
                if (!node.children) {
                    return arr.push(node.id)
                }
                node.children.forEach(item => {
                    this.getLeafKeys(item, arr)
                })
            }
        }
    }
</script>

<style scoped lang="less">
    .el-tag {
        margin: 7px;
    }

    .bdtop {
        border-top: 1px solid #eee;
    }

    .bdbottom {
        border-bottom: 1px solid #eee;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>
