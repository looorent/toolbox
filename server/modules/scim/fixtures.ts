export interface SampleUser {
  userName: string
  displayName: string
  givenName: string
  familyName: string
  email: string
  title: string
  active: boolean
}

export interface SampleGroup {
  displayName: string
  memberUserNames: string[]
}

export const SAMPLE_USERS: SampleUser[] = [
  {
    userName: 'carol_sturka',
    displayName: 'Carol Sturka',
    givenName: 'Carol',
    familyName: 'Sturka',
    email: 'carol_sturka@pluribus.tv',
    title: '',
    active: true,
  },
  {
    userName: 'zosia_other',
    displayName: 'Zosia',
    givenName: 'Zosia',
    familyName: '',
    email: 'zosia_other@pluribus.tv',
    title: '',
    active: true,
  },
  {
    userName: 'manousos_o',
    displayName: 'Manousos Oviedo',
    givenName: 'Manousos',
    familyName: 'Oviedo',
    email: 'manousos_o@pluribus.tv',
    title: '',
    active: true,
  },
  {
    userName: 'koumba_d',
    displayName: 'Koumba Diabaté',
    givenName: 'Koumba',
    familyName: 'Diabaté',
    email: 'koumba_d@pluribus.tv',
    title: '',
    active: true,
  },
  {
    userName: 'laxmi_i',
    displayName: 'Laxmi',
    givenName: 'Laxmi',
    familyName: '',
    email: 'laxmi_i@pluribus.tv',
    title: '',
    active: true,
  },
  {
    userName: 'otgonbayar_m',
    displayName: 'Otgonbayar',
    givenName: 'Otgonbayar',
    familyName: '',
    email: 'otgonbayar_m@pluribus.tv',
    title: '',
    active: true,
  },
  {
    userName: 'xiu_mei',
    displayName: 'Xiu Mei',
    givenName: 'Xiu',
    familyName: 'Mei',
    email: 'xiu_mei@pluribus.tv',
    title: '',
    active: true,
  },
  {
    userName: 'kusimayu_v',
    displayName: 'Kusimayu',
    givenName: 'Kusimayu',
    familyName: '',
    email: 'kusimayu_v@pluribus.tv',
    title: '',
    active: true,
  },
]

export const SAMPLE_GROUPS: SampleGroup[] = [
  {
    displayName: 'The Immune',
    memberUserNames: ['carol_sturka', 'manousos_o', 'koumba_d', 'laxmi_i', 'otgonbayar_m', 'xiu_mei', 'kusimayu_v'],
  },
  { displayName: 'The Others', memberUserNames: ['zosia_other'] },
  { displayName: 'The English Six', memberUserNames: [] },
]
