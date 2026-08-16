import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mywedding.com' },
    update: {},
    create: {
      email: 'admin@mywedding.com',
      password: hashedPassword,
    },
  })
  console.log('Admin user seeded:', admin.email)

  // Seed Sample Event
  const event = await prisma.event.upsert({
    where: { slug: 'sample-wedding' },
    update: {},
    create: {
      slug: 'sample-wedding',
      brideNameKm: 'សុខ នារី',
      brideNameEn: 'Sok Neary',
      groomNameKm: 'សៅ បូរ៉ា',
      groomNameEn: 'Sao Bora',
      eventDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      eventTime: '17:00',
      locationNameKm: 'សណ្ឋាគារ ហៃយ៉ាត់',
      locationNameEn: 'Hyatt Regency',
      locationAddressKm: 'ភ្នំពេញ កម្ពុជា',
      locationAddressEn: 'Phnom Penh, Cambodia',
      invitationMessageKm: 'សូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី ចូលរួមជាអធិបតី និងភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។',
      invitationMessageEn: 'We joyfully invite you to celebrate our wedding.',
      theme: 'Classic Khmer Wedding',
      musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      musicTitle: 'Romantic Wedding Song',
      heroVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      heroVideoType: 'mp4',
      showHeroVideo: true,
      openingImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552',
      openingTitleKm: 'សូមគោរពអញ្ជើញ',
      openingTitleEn: 'You are warmly invited',
      openingMessageKm: 'ចូលរួមជាអធិបតីភាពក្នុងពិធីមង្គលការ',
      openingMessageEn: 'To celebrate the wedding of our children',
      showOpeningScreen: true,
      galleryImages: [
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc',
        'https://images.unsplash.com/photo-1519741497674-611481863552',
      ],
    },
  })
  console.log('Sample event seeded:', event.slug)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
