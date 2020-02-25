<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片表格区-->
        <el-card class="box-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable
                              @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
                </el-col>
            </el-row>
            <el-table border stripe
                      :data="userlist"
                      style="width: 100%">
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column
                        prop="username"
                        label="姓名">
                </el-table-column>
                <el-table-column
                        prop="role_name"
                        label="角色">
                </el-table-column>
                <el-table-column
                        prop="create_time"
                        label="日期">
                </el-table-column>
                <el-table-column
                        prop="mobile"
                        label="联系方式">
                </el-table-column>
                <el-table-column
                        prop="email"
                        label="邮箱">
                </el-table-column>
                <el-table-column
                        label="状态">
                    <template slot-scope="scope">
                        <el-switch
                                v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column width="180"
                                 label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"
                                   circle></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="deleteConfirm(scope.row)"></el-button>
                        <el-tooltip class="item" effect="dark" content="分配角色" placement="top-end" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" circle></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[2, 4, 8, 16]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <el-dialog
                title="添加用户"
                :visible.sync="addDialogVisible"
                width="30%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
        </el-dialog>
        <el-dialog
                title="修改用户"
                :visible.sync="updateDialogVisible"
                width="50%" @close="updateDialogClosed">
            <el-form :model="updateForm" :rules="updateFormRules" ref="updateFormRef" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="updateForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="updateForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="updateForm.mobile"></el-input>
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
    name: "Users",
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
          query: "",
          pagenum: 1,
          pagesize: 2
        },
        userlist: [],
        total: 0,
        addDialogVisible: false,//控制新增对话框可见
        updateDialogVisible: false,//控制修改对话框可见
        //添加用户的表单数据
        addForm: {
          username: "",
          password: "",
          email: "",
          mobile: ""
        },
        //添加表单的验证规则
        addFormRules: {
          username: [
            { required: true, message: "请输入用户名", trigger: "blur" },
            { min: 3, max: 10, message: "用户名的长度在3-10个字符内" }
          ],
          password: [
            { required: true, message: "请输入密码", trigger: "blur" },
            { min: 6, max: 15, message: "用户名的长度在6-15个字符内" }
          ],
          email: [
            { required: true, message: "请输入邮箱", trigger: "blur" },
            { validator: checkEmail, trigger: "blur" }
          ],
          mobile: [
            { required: true, message: "请输入手机", trigger: "blur" },
            { validator: checkMobile, trigger: "blur" }
          ]
        },
        updateForm: {},
        updateFormRules: {
          email: [
            { required: true, message: "请输入邮箱", trigger: "blur" },
            { validator: checkEmail, trigger: "blur" }
          ],
          mobile: [
            { required: true, message: "请输入手机", trigger: "blur" },
            { validator: checkMobile, trigger: "blur" }
          ]
        }
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const { data: res } = await this.$http.get("users", { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error("获取用户列表失败!")
        }
        this.userlist = res.data.users
        this.total = res.data.total
      },
      //监听pagesize变化的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      //监听页码值改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      //监听switch用户状态
      async userStateChange(userinfo) {
        const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
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
          const { data: res } = await this.$http.post("users", this.addForm)
          if (res.meta.status !== 201) {
            this.$message.error("添加用户失败!")
          }
          this.$message.success("添加用户成功!")
          this.addDialogVisible = false
          this.getUserList()
        })
      },
      //修改
      async showEditDialog(userinfo) {
        this.updateDialogVisible = true
        const { data: res } = await this.$http.get(`users/${userinfo.id}`)
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
          const { data: res } = await this.$http.put(`users/${this.updateForm.id}`, this.updateForm)
          if (res.meta.status !== 200) {
            this.$message.error("修改用户失败!")
          }
          this.$message.success("修改用户成功!")
          this.updateDialogVisible = false
          this.getUserList()
        })
      },
      deleteConfirm(userinfo){
        {
          this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
            const {data:res}=await this.$http.delete(`users/${userinfo.id}`)
            if(res.meta.status===200){
              this.getUserList()
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
            }else {
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
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
