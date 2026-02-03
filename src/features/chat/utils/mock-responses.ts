/**
 * Mock AI responses for demo
 */

import { ChatAttachment } from '../types';

// Pre-defined AI responses for demo
const GENERAL_RESPONSES = [
    "Tôi hiểu bạn đang hỏi về lộ trình học của mình. Dựa trên tiến độ hiện tại, bạn đang làm rất tốt! Hãy tiếp tục duy trì nhịp độ này.",
    "Đó là một câu hỏi hay! Theo kinh nghiệm, việc chia nhỏ các task và học theo từng phần sẽ giúp bạn tiếp thu tốt hơn.",
    "Tôi khuyên bạn nên tập trung vào những concept cơ bản trước khi chuyển sang các chủ đề nâng cao hơn.",
    "Dựa trên dữ liệu học tập của bạn, tôi thấy bạn học hiệu quả nhất vào buổi sáng. Hãy cân nhắc sắp xếp các task khó vào thời điểm này.",
];

const TASK_RESPONSES = [
    "Task **{taskName}** này là một phần quan trọng của module. Tôi khuyên bạn nên:\n\n1. Đọc qua tài liệu chính thức trước\n2. Thực hành với các ví dụ đơn giản\n3. Tự viết code và debug\n\nNếu gặp khó khăn, hãy hỏi tôi thêm nhé!",
    "Về task **{taskName}**, đây là những điểm chính cần nắm:\n\n- Hiểu concept cơ bản\n- Áp dụng vào thực tế\n- Luyện tập thường xuyên\n\nBạn đã hoàn thành bao nhiêu phần rồi?",
    "Task **{taskName}** thường mất khoảng 30-45 phút để hoàn thành. Một số tips:\n\n✅ Tập trung vào một việc tại một thời điểm\n✅ Ghi chú những điểm quan trọng\n✅ Review lại sau khi hoàn thành",
];

const MODULE_RESPONSES = [
    "Module **{moduleName}** bao gồm nhiều khái niệm quan trọng. Tôi khuyên bạn nên:\n\n1. Hoàn thành theo thứ tự các task\n2. Không skip các phần cơ bản\n3. Làm bài tập thực hành\n\nBạn đang stuck ở phần nào?",
    "Về module **{moduleName}**, đây là roadmap tôi đề xuất:\n\n📚 **Tuần 1:** Nắm vững lý thuyết\n💻 **Tuần 2:** Thực hành coding\n🔄 **Tuần 3:** Review và consolidate\n\nBạn muốn tôi đi sâu vào phần nào?",
    "Module **{moduleName}** là nền tảng cho các phần tiếp theo. Hãy chắc chắn bạn hiểu rõ:\n\n- Core concepts\n- Best practices\n- Common pitfalls\n\nCần tôi giải thích thêm không?",
];

const GREETING_RESPONSES = [
    "Chào bạn! 👋 Tôi là AI assistant của StudySense. Tôi có thể giúp bạn:\n\n- Giải đáp thắc mắc về lộ trình học\n- Đề xuất phương pháp học hiệu quả\n- Phân tích tiến độ học tập\n\nBạn cần hỗ trợ gì hôm nay?",
    "Xin chào! 🌟 Tôi sẵn sàng hỗ trợ bạn trong hành trình học tập. Bạn có thể:\n\n- Đính kèm task/module để hỏi cụ thể\n- Hỏi về phương pháp học\n- Xem phân tích tiến độ\n\nCó gì tôi có thể giúp bạn?",
];

// Helper to get random item from array
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Check if message is a greeting
const isGreeting = (content: string): boolean => {
    const greetings = ['hi', 'hello', 'chào', 'xin chào', 'hey', 'chao'];
    return greetings.some(g => content.toLowerCase().includes(g));
};

/**
 * Generate mock AI response based on user message and attachments
 */
export function generateMockAIResponse(
    userMessage: string,
    attachments?: ChatAttachment[]
): string {
    // Check for greeting
    if (isGreeting(userMessage) && (!attachments || attachments.length === 0)) {
        return getRandomItem(GREETING_RESPONSES);
    }

    // If there are attachments, respond based on type
    if (attachments && attachments.length > 0) {
        const responses: string[] = [];

        for (const attachment of attachments) {
            if (attachment.type === 'task') {
                const template = getRandomItem(TASK_RESPONSES);
                responses.push(template.replace('{taskName}', attachment.title));
            } else if (attachment.type === 'module') {
                const template = getRandomItem(MODULE_RESPONSES);
                responses.push(template.replace('{moduleName}', attachment.title));
            }
        }

        if (responses.length > 0) {
            return responses.join('\n\n---\n\n');
        }
    }

    // Default general response
    return getRandomItem(GENERAL_RESPONSES);
}
