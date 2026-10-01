package com.svnstartech.bondroot;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.svnstartech.bondroot.model.Person;
import com.svnstartech.bondroot.model.UserAccount;
import com.svnstartech.bondroot.repository.PersonRepository;
import com.svnstartech.bondroot.ui.AddPersonActivity;
import com.svnstartech.bondroot.ui.FamilyTreeActivity;
import com.svnstartech.bondroot.ui.FindRelationshipActivity;
import com.svnstartech.bondroot.ui.PersonProfileActivity;
import com.svnstartech.bondroot.ui.SignupActivity;
import com.svnstartech.bondroot.ui.adapter.PersonAdapter;
import com.svnstartech.bondroot.util.LanguageManager;

import java.util.List;

public class MainActivity extends AppCompatActivity {

    private TextView tvUserName, tvUserPersonId, tvTotalPeopleCount, tvCurrentLanguageLabel;
    private MaterialButton btnToggleLanguage, btnRunTestCase, btnFindRelationship, btnViewTree, btnAddMember, btnSignupFlow;
    private MaterialCardView cardIncompleteTree;
    private MaterialButton btnAddParentQuick, btnAddMemberQuick;
    private RecyclerView rvPersons;

    private PersonRepository repository;
    private List<Person> allPersons;

    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(LanguageManager.applyLocale(newBase));
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        repository = PersonRepository.getInstance(this);

        tvCurrentLanguageLabel = findViewById(R.id.tvCurrentLanguageLabel);
        btnToggleLanguage = findViewById(R.id.btnToggleLanguage);
        tvUserName = findViewById(R.id.tvUserName);
        tvUserPersonId = findViewById(R.id.tvUserPersonId);
        tvTotalPeopleCount = findViewById(R.id.tvTotalPeopleCount);

        cardIncompleteTree = findViewById(R.id.cardIncompleteTree);
        btnAddParentQuick = findViewById(R.id.btnAddParentQuick);
        btnAddMemberQuick = findViewById(R.id.btnAddMemberQuick);

        btnRunTestCase = findViewById(R.id.btnRunTestCase);
        btnFindRelationship = findViewById(R.id.btnFindRelationship);
        btnViewTree = findViewById(R.id.btnViewTree);
        btnAddMember = findViewById(R.id.btnAddMember);
        btnSignupFlow = findViewById(R.id.btnSignupFlow);
        rvPersons = findViewById(R.id.rvPersons);

        rvPersons.setLayoutManager(new LinearLayoutManager(this));

        setupLanguageToggle();

        // 1. Run Master Test Case (Muhib ↔ Grandfather's Brother's Son's Son)
        btnRunTestCase.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, FindRelationshipActivity.class);
            intent.putExtra("personA_id", "P100005"); // Muhib
            intent.putExtra("personB_id", "P100006"); // Kamal Hossain (Grandfather's Brother's Son's Son)
            startActivity(intent);
        });

        // 2. Open General Relationship Finder
        btnFindRelationship.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, FindRelationshipActivity.class);
            startActivity(intent);
        });

        // 3. Open Family Genealogy Tree
        btnViewTree.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, FamilyTreeActivity.class);
            startActivity(intent);
        });

        // 4. Add Family Member
        btnAddMember.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, AddPersonActivity.class);
            startActivity(intent);
        });

        // 5. Open Signup Flow
        btnSignupFlow.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, SignupActivity.class);
            startActivity(intent);
        });

        btnAddParentQuick.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, AddPersonActivity.class);
            startActivity(intent);
        });

        btnAddMemberQuick.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, AddPersonActivity.class);
            startActivity(intent);
        });

        loadDashboardData();
    }

    private void setupLanguageToggle() {
        boolean isEnglish = LanguageManager.isEnglish(this);

        if (isEnglish) {
            tvCurrentLanguageLabel.setText("🌐 Language: English (EN)");
            btnToggleLanguage.setText("বাংলায় দেখুন (BN)");
        } else {
            tvCurrentLanguageLabel.setText("🌐 ভাষা: বাংলা (BN)");
            btnToggleLanguage.setText("Switch to English (EN)");
        }

        btnToggleLanguage.setOnClickListener(v -> {
            if (LanguageManager.isEnglish(this)) {
                LanguageManager.setLanguage(this, LanguageManager.LANG_BANGLA);
                Toast.makeText(this, "ভাষা বাংলায় পরিবর্তিত হয়েছে", Toast.LENGTH_SHORT).show();
            } else {
                LanguageManager.setLanguage(this, LanguageManager.LANG_ENGLISH);
                Toast.makeText(this, "Language switched to English", Toast.LENGTH_SHORT).show();
            }
            recreate();
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadDashboardData();
    }

    private void loadDashboardData() {
        boolean isEnglish = LanguageManager.isEnglish(this);
        allPersons = repository.getAllPersons();

        // Localize action buttons
        btnFindRelationship.setText(getString(R.string.btn_find_relationship));
        btnViewTree.setText(getString(R.string.btn_view_tree));
        btnAddMember.setText(getString(R.string.btn_add_member));
        btnSignupFlow.setText(getString(R.string.btn_signup_flow));
        btnRunTestCase.setText(getString(R.string.btn_run_test_case));

        // Active user profile & incomplete family tree detection
        UserAccount account = repository.getActiveUserAccount();
        if (account != null && account.getLinkedPersonId() != null) {
            Person userPerson = repository.getPersonById(account.getLinkedPersonId());
            if (userPerson != null) {
                tvUserName.setText(userPerson.getDisplayName(isEnglish));
                String fatherName = isEnglish ? "Unknown" : "অজানা";
                if (userPerson.getFatherId() != null) {
                    Person father = repository.getPersonById(userPerson.getFatherId());
                    if (father != null) fatherName = father.getDisplayName(isEnglish);
                }
                String fatherLabel = isEnglish ? "Father" : "পিতা";
                tvUserPersonId.setText("Person ID: " + userPerson.getPersonId() + " • " + fatherLabel + ": " + fatherName + " • " + account.getEmail());

                // Check if tree is incomplete (e.g. Missing mother or father)
                boolean missingMother = userPerson.getMotherId() == null || userPerson.getMotherId().trim().isEmpty();
                boolean missingFather = userPerson.getFatherId() == null || userPerson.getFatherId().trim().isEmpty();
                if (missingMother || missingFather) {
                    cardIncompleteTree.setVisibility(View.VISIBLE);
                } else {
                    cardIncompleteTree.setVisibility(View.GONE);
                }
            }
        }

        String membersHeader = isEnglish ?
                ("Genealogy Database (" + allPersons.size() + " Members)") :
                ("ডাটাবেজের সদস্য তালিকা (মোট " + allPersons.size() + " জন)");
        tvTotalPeopleCount.setText(membersHeader);

        PersonAdapter adapter = new PersonAdapter(allPersons, repository, person -> {
            Intent intent = new Intent(MainActivity.this, PersonProfileActivity.class);
            intent.putExtra("person_id", person.getPersonId());
            startActivity(intent);
        });
        rvPersons.setAdapter(adapter);
    }
}
