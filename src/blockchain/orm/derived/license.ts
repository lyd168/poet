import { Column, ManyToOne, Table, PrimaryColumn } from 'typeorm'
import Work from './work'
import Profile from './profile'
import Offering from './offering'

@Table()
export default class License {

  @PrimaryColumn()
  id: string

  @ManyToOne(type => Work, work => work.licenses, { nullable: true })
  reference: Work

  @ManyToOne(type => Offering, offering => offering.licenses, { nullable: true })
  referenceOffering: Offering

  @ManyToOne(type => Profile, profile => profile.licenses, { nullable: true })
  licenseHolder: Profile

  @Column({ nullable: true })
  proofType: string

  @Column({ nullable: true })
  proofValue: string
}
