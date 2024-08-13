import React, { useState } from 'react'
import { Modal, Steps } from 'antd'
import firstLoadUtils from '@/utils/localStorge/firstLoad'
const ExplanatoryPopup = () => {
  const [isModalOpen, setIsModalOpen] = useState(true)
  const handleClose = () => {
    setIsModalOpen(false)
    firstLoadUtils.set()
  }
  return (<Modal title="引导弹窗(如何预览一个vue/tsx文件)" open={isModalOpen} okText="知道了" cancelText="关闭" onOk={handleClose} onCancel={handleClose}>
    <Steps
      direction="vertical"
      current={0}
      percent={0}
      items={[
        {
          title: '第一步',
          description: '点击左上角的选择文件按钮',
        },
        {
          title: '第二步',
          description: '选择一个项目文件夹（vue/react的项目，因为没对angular项目的文件，做兼容预览）',
        },
        {
          title: '第三步',
          description: '在左边侧边栏，选择一个vue/tsx文件，点击',
        },
        {
          title: '第四步',
          description: '右边的主内容区域，就会显示当前文件的内容。至此，预览文件就完成了',
        },
      ]}
    />
  </Modal>)
}
export default ExplanatoryPopup