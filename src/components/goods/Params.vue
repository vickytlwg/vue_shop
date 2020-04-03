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
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">
                        添加参数
                    </el-button>
                    <el-table
                            :data="manyTableData"
                            style="width: 100%">
                        <el-table-column type="expand" label="">
                        </el-table-column>
                        <el-table-column type="index" label="#">
                        </el-table-column>
                        <el-table-column
                                prop="attr_name"
                                label="参数名称"
                                width="180">
                        </el-table-column>
                        <el-table-column
                                label="操作"
                                width="180">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                           @click="showEditDialog(scope.row)"
                                           circle></el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" circle
                                           @click="deleteConfirm(scope.row)"></el-button>
                            </template>
                        </el-table-column>

                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">
                        添加参数
                    </el-button>
                    <el-table
                            :data="onlyTableData"
                            style="width: 100%">
                        <el-table-column type="expand" label="">
                        </el-table-column>
                        <el-table-column type="index" label="#">
                        </el-table-column>
                        <el-table-column
                                prop="attr_name"
                                label="属性名称"
                                width="180">
                        </el-table-column>
                        <el-table-column
                                label="操作"
                                width="180">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                           @click="showEditDialog(scope.row)"
                                           circle></el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" circle
                                           @click="deleteConfirm(scope.row)"></el-button>
                            </template>
                        </el-table-column>

                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <el-dialog
                :title="'添加'+titleText"
                :visible.sync="addDialogVisible"
                width="50%">
            <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="100px" class="demo-ruleForm">
                <el-form-item label="活动名称" prop="name">
                    <el-input v-model="addForm.name"></el-input>
                </el-form-item>
                <el-form-item label="活动区域" prop="region">
                    <el-select v-model="addForm.region" placeholder="请选择活动区域">
                        <el-option label="区域一" value="shanghai"></el-option>
                        <el-option label="区域二" value="beijing"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
  export default {
    name: "Params",
    data() {
      return {
        parentCateList: [],
        cascaderProps: {
          value: "cat_id",
          label: "cat_name",
          children: "children",
          expandTrigger: "hover",
          checkStrictly: false
        },
        selectKeys: [],
        activeName: "many",
        onlyTableData: [],
        manyTableData: [],
        addDialogVisible: false
      }
    },
    created() {
      this.getParentCateList()
    },
    computed: {
      isBtnDisabled() {
        if (this.selectKeys.length === 3) {
          return false
        } else {
          return true
        }
      },
      cateId() {
        if (this.selectKeys.length === 3) {
          return this.selectKeys[2]
        }
        return null
      },
      titleText() {
        if (this.activeName === "many") {
          return "动态参数"
        } else {
          return "静态属性"
        }
      }
    },
    methods: {
      async getParentCateList() {
        const { data: res } = await this.$http.get("categories", { params: { type: 3 } })
        if (res.meta.status !== 200) {
          return this.$message.error("获取父级分类失败!")
        }
        console.log(res)
        this.parentCateList = res.data
      },
      async getList() {
        let that = this
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) {
          return this.$message.error("获取分类列表失败!")
        }
        console.log(res)
        if (this.activeName === "many") {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      },
      parentCateChange() {
        if (this.selectKeys.length !== 3) {
          this.selectKeys = []
          return
        } else {
          this.getList()
        }
      },
      handleClick() {
        console.log(this.activeName)
        this.getList()
      }
    }
  }
</script>

<style scoped>
    .cat_opt {
        margin: 15px 5px;
    }
</style>
