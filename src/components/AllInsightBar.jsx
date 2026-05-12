export default function AIInsightBar() {
  return (
    <div className="bg-white rounded-[24px] px-5 py-5 shadow-sm mb-4">
      <div className="flex items-center gap-2 text-[16px] font-semibold">
        <span>✅</span>
        <span>当前组合偏稳健，债基占比较高</span>
      </div>
      <div className="mt-4 rounded-[12px] bg-[#f8f8fa] px-4 py-3 text-[14px] font-medium">
      
        <span>有基金近期波动较大，建议关注</span>
    
      </div>
    </div>
  )
}