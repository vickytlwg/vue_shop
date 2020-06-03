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
                    <el-button type="primary" @click="showAddDialog()">添加分类</el-button>
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
                <el-form-item label="父级分类">
                    <div class="block">
                        <el-cascader size="medium"
                                     v-model="selectKeys"
                                     :options="parentCateList"
                                     :props="cascaderProps"
                                     @change="parentCateChange" clearable></el-cascader>
                    </div>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
        </el-dialog>
        <el-dialog
                title="修改分类"
                :visible.sync="updateDialogVisible"
                width="50%" @close="updateDialogClosed">
            <el-form :model="updateForm" :rules="updateFormRules" ref="updateFormRef" label-width="80px">
                <el-form-item label="分类名称">
                    <el-input v-model="updateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="updateCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
  export default {
    name: "Cate",
    data() {
      return {
        //获取分类列表的参数
        queryInfo: {
          // type: 1,
          pagenum: 1,
          pagesize: 5
        },
        CateList: [],
        columns: [{
          label: "分类名称",
          prop: "cat_name"
        }, {
          label: "是否有效",
          type: "template",
          template: "isok"
        }, {
          label: "排序",
          type: "template",
          template: "order"
        }, {
          label: "操作",
          type: "template",
          template: "opt"
        }],
        total: 0,
        addDialogVisible: false,//控制新增对话框可见
        updateDialogVisible: false,//控制修改对话框可见
        //添加分类的表单数据
        addForm: {
          cat_name: "",
          cat_level: 0,
          cat_pid: 0
        },
        //添加表单的验证规则
        addFormRules: {
          cat_name: [
            { required: true, message: "请输入分类名", trigger: "blur" }
          ]
        },
        updateForm: {},
        updateFormRules: {
          cat_name: [
            { required: true, message: "请输入邮箱", trigger: "blur" }
          ]
        },
        userInfo: {},
        selectedRoleId: "",
        parentCateList: [],
        cascaderProps: {
          value: "cat_id",
          label: "cat_name",
          children: "children",
          expandTrigger: "hover",
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
        const { data: res } = await this.$http.get("categories", { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error("获取分类列表失败!")
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
      //close对话框之后清空事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
        this.selectKeys = []
        this.addForm.cat_level = 0
        this.addForm.cat_pid = 0
      },
      //添加分类
      addCate() {
        console.log(this.addForm)
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post("categories", this.addForm)
          if (res.meta.status !== 201) {
            this.$message.error("添加分类失败!")
          } else {
            this.$message.success("添加分类成功!")
            this.addDialogVisible = false
            this.getCateList()
          }
        })
      },
      //修改
      async showEditDialog(info) {
        this.updateDialogVisible = true
        const { data: res } = await this.$http.get(`categories/${info.cat_id}`)
        if (res.meta.status === 200) {
          this.updateForm = res.data
        }
      },
      //close对话框之后清空事件
      updateDialogClosed() {
        this.$refs.updateFormRef.resetFields()
        this.selectKeys = []
        this.addForm.cat_level = 0
        this.addForm.cat_pid = 0
      },
      updateCate() {
        this.$refs.updateFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put(`categories/${this.updateForm.cat_id}`, this.updateForm)
          if (res.meta.status !== 200) {
            this.$message.error("修改分类失败!")
          }
          this.$message.success("修改分类成功!")
          this.updateDialogVisible = false
          this.getCateList()
        })
      },
      deleteConfirm(info) {
        {
          this.$confirm("此操作将永久删除该分类, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(async () => {
            const { data: res } = await this.$http.delete(`categories/${info.cat_id}`)
            if (res.meta.status === 200) {
              this.getCateList()
              this.$message({
                type: "success",
                message: "删除成功!"
              })
            } else {
              this.$message({
                type: "error",
                message: "删除失败!"
              })
            }
          }).catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            })
          })
        }
      },
      showAddDialog() {
        this.getParentCateList()
        this.addDialogVisible = true
      },
      async getParentCateList() {
        const { data: res } = await this.$http.get("categories", { params: { type: 2 } })
        if (res.meta.status !== 200) {
          return this.$message.error("获取父级分类失败!")
        }
        console.log(res)
        this.parentCateList = res.data
        this.selectKeys=[3403]
      },
      parentCateChange() {
        if (this.selectKeys.length > 0) {
          this.addForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
          this.addForm.cat_level = this.selectKeys.length
          return
        } else {
          this.addForm.cat_pid = 0
          this.addForm.cat_level = 0
        }
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
